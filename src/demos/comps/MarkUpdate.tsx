import { useEffect, useState } from "react";
import { IRenderInfo } from "helux";
import { nodupPush, getLocaleTime } from "../logic/util";

interface IProps {
  info?: IRenderInfo | Array<IRenderInfo>;
  name?: string;
  children: any;
  forceColor?: boolean;
}

const colors = ["#0944d0", "#fc774b", "#1da187", "#fdc536", "#1789f5"];
let curIdx = 0;

function getColor(sn: number, forceColor?: boolean) {
  let idx = 0;
  const force = sn === 0 && forceColor === undefined ? true : forceColor;
  if (force) {
    idx = curIdx % colors.length;
    curIdx++;
  } else {
    idx = sn % colors.length;
  }

  const color = colors[idx];
  return color;
}

const fakeInfo = { sn: 0, insKey:0, getDeps: () => [] };

function ensureInfos(info: IRenderInfo | Array<IRenderInfo>) {
  let infos: IRenderInfo[] = [];
  if (!Array.isArray(info)) {
    infos = [info];
  } else {
    infos = info || [];
  }
  return infos;
}

function getInfoData(
  info: IRenderInfo | Array<IRenderInfo>,
  genDepStr?: boolean
) {
  const infos = ensureInfos(info);
  let sn = 0;
  let depStr = "";
  const insKeyStr = infos.map(item=>item.insKey).join(',');
  const deps: string[] = [];
  infos.forEach((item) => {
    sn += item.sn;
    if (genDepStr) {
      item.getDeps().forEach((dep) => nodupPush(deps, dep));
    }
  });
  depStr = deps.join(" , ");
  return {
    sn,
    depStr,
    insKeyStr,
  };
}

function useMarkUpdate(info: IRenderInfo | Array<IRenderInfo>) {
  const [depStr, setDepStr] = useState("");
  const { sn, insKeyStr } = getInfoData(info);
  useEffect(() => {
    setDepStr(getInfoData(info, true).depStr); // 此时调用获取到当前的渲染依赖
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sn, info]);
  let snLabel = Array.isArray(info) ? "sn sum" : "sn";
  const snNode = sn ? `(${snLabel} ${sn})` : "";
  return { depStr, snNode, sn, insKeyStr };
}

function Ui(props: IProps) {
  const { name = "MarkUpdate", info = fakeInfo, forceColor } = props;
  const { snNode, depStr, sn, insKeyStr } = useMarkUpdate(info);
  return (
    <div className="box">
      {props.children}
      <div
        className="info"
        style={{ backgroundColor: getColor(sn, forceColor) }}
      >
        [{name}] update at {getLocaleTime()} {snNode} (insKey {insKeyStr})
      </div>
      {depStr && <div style={{ color: "green" }}> deps is [ {depStr} ]</div>}
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
