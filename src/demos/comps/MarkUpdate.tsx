import { useRef } from "react";
import { IRenderInfo, IFnRenderInfo } from "helux";
import { nodupPush, getLocaleTime } from "../logic/util";

type Info = IFnRenderInfo | IRenderInfo;

interface IProps {
  info?: IRenderInfo | Array<IRenderInfo>;
  name?: string;
  children: any;
  /** 强制按顺序读取新颜色 */
  forceColor?: boolean;
  /** 不一样标识条是否在头部 */
  top?: boolean;
}

const colors = ["#0944d0", "#fc774b", "#1da187", "#fdc536", "#1789f5"];

function getColor(sn: number, curIdx: number, forceColor = false) {
  let idx = 0;
  if (forceColor || sn === 0) {
    idx = curIdx % colors.length;
    curIdx++;
  } else {
    idx = sn % colors.length;
  }

  const color = colors[idx];
  return color;
}

const fakeInfo = { time: 0, sn: 0, insKey: 0, getDeps: () => [] };

function ensureInfos(info: Info | Array<Info>) {
  let infos: Info[] = [];
  if (!Array.isArray(info)) {
    infos = [info];
  } else {
    infos = info || [];
  }
  return infos;
}

function getInfoData(
  info: Info | Array<Info>,
) {
  const infos = ensureInfos(info);
  let sn = 0;
  let depStr = "";
  const insKeyStr = infos.map(item => item.insKey).join(',');
  const deps: string[] = [];
  infos.forEach((item) => {
    sn += item.sn;
    const currDeps = item.getDeps();
    currDeps.forEach((dep) => nodupPush(deps, dep));
  });
  depStr = deps.join(" , ");
  const snStr = infos.length > 1 ? `(sn sum ${sn})` : `(sn ${sn})`

  return {
    sn,
    depStr,
    snStr,
    insKeyStr,
  };
}

function Ui(props: IProps) {
  const idxRef = useRef(0);
  const { name = "MarkUpdate", info = fakeInfo, forceColor, top } = props;
  const curIdx = idxRef.current;
  const { sn, insKeyStr, depStr, snStr } = getInfoData(info);
  idxRef.current += 1;

  const uiMarkBar = (<>
    <div
      className="info"
      style={{ backgroundColor: getColor(sn, curIdx, forceColor) }}
    >
      [{name}] update at {getLocaleTime()}
      {info !== fakeInfo && <span>{snStr} insKey {insKeyStr}</span>}
    </div>
    {depStr && <div style={{ color: "green" }}> deps is [ {depStr} ]</div>}
  </>);

  return (
    <div className="box">
      {top && uiMarkBar}
      {props.children}
      {!top && uiMarkBar}
    </div>
  );
}

export function MarkUpdate(props: IProps) {
  return <Ui {...props}>{props.children}</Ui>;
}

export function MarkUpdateH1(props: IProps) {
  return (
    <Ui {...props}>
      <h1>{props.children}</h1>
    </Ui>
  );
}

export function MarkUpdateH2(props: IProps) {
  return (
    <Ui {...props}>
      <h2>{props.children}</h2>
    </Ui>
  );
}

export function MarkUpdateH3(props: IProps) {
  return (
    <Ui {...props}>
      <h3>{props.children}</h3>
    </Ui>
  );
}
