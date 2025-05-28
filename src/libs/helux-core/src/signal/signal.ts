import { ReactNode } from '@helux/types';
import { isFn, prefixValKey } from '@helux/utils';
import { original } from 'limu';
import { IS_BLOCK } from '../consts';
import { getApiCtx } from '../common/transfer';
import { isAtom, isDerivedAtom } from '../factory/common/atom';
import { disableReuseLatest, enableReuseLatest, getLastest } from '../factory/common/blockScope';
import { getSharedKey } from '../helpers/state';
import type { CoreApiCtx } from '../types/api-ctx';
import type { SingalVal, RenderCbType, LoadingStatus } from '../types/base';
import { dynamicBlockWithRead } from './block';
import { alwaysEqual, wrapDerivedAtomSignalComp, wrapDerivedSignalComp, wrapSignalComp } from './common/wrap';
import { noopVal } from './common/util';

interface ISignalLogicOptions {
  input: SingalVal | (() => SingalVal),
  mayFormat?: (val: any) => any,
  enableStatus?: boolean,
  ref?: any,
  viewProps?: any,
  useStatusList?: () => LoadingStatus[];
}

const str2CompType: Record<string, string> = {
  'Symbol(react.forward_ref)': 'forwardRef',
  'Symbol(react.memo)': 'memo',
};
const compTypeMap: Record<string, number> = {
  'forwardRef': 1,
  'memo': 1,
};

function mayLogNotFnError(input: any, label: string) {
  if (!isFn(input)) {
    console.error(`found ${label} not a function, this may lead an unexpected render result!`);
  }
}

function getCbType(result: any) {
  if (!result) {
    return 'normal';
  }
  // React.forwardRef 包裹的对象形如
  // $$typeof Symbol(react.forward_ref)
  // render (props, b) => {…}
  // displayName: undefined or 'xxx'

  // React.meno 包裹的对象形如
  // $$typeof : Symbol(react.memo)
  // compare : null
  // type : (props, b) => {…}
  // displayName : undefined or 'xxx'

  const reactTypeOf = result['$$typeof'] || '';
  const str: string = reactTypeOf.toString();
  return (str2CompType[str] || 'normal') as RenderCbType;
}

function signalLogic(apiCtx: CoreApiCtx, options: ISignalLogicOptions): ReactNode {
  const { input, mayFormat, enableStatus, ref, viewProps, useStatusList } = options;
  const { react } = apiCtx;
  if (input && (input as any)[IS_BLOCK]) {
    return react.createElement(input as any);
  }
  const compare = alwaysEqual;
  const isInputFn = isFn(input);
  const isFormatFn = isFn(mayFormat);
  const cbType = getCbType(mayFormat);
  const isFormatAsComp = !!compTypeMap[cbType];

  // 此时 format 作为渲染函数，input 作为锁定依赖的函数，返回结果同时也会透传给渲染函数
  // const getProps = ()=>({ name: state.info.name, age: state.info.age });
  // const Info = (props)=><div>name:{props.name}-age{props.age}</div>;
  // for $(getProps, Info),
  // <BlockView data={getProps} comp={Info} />
  // <SignalView input={getProps} format={Info} />
  if (isInputFn && isFormatAsComp) {
    const estatus = typeof mayFormat === 'boolean' ? mayFormat : enableStatus;
    const renderFn: any = mayFormat;
    if (!renderFn.displayName) {
      renderFn.displayName = 'BlockViewRender';
    }
    const options = { compare, read: input, enableStatus: estatus, ref, viewProps, cbType, useStatusList };
    const Comp = dynamicBlockWithRead(apiCtx, renderFn, options);
    return react.createElement(Comp);
  }

  const result = isInputFn ? input() : input;
  const format = isFormatFn ? mayFormat : noopVal;
  // for $(derivdedAtom) , $(()=>derivdedAtom)
  if (isDerivedAtom(result)) {
    const Comp = wrapDerivedAtomSignalComp(apiCtx, { result, compare, format });
    return react.createElement(Comp);
  }

  // for $(atom), $(()=>atom)
  if (isAtom(result)) {
    const sharedKey = getSharedKey(result);
    const depKey = prefixValKey('val', sharedKey);
    const keyPath = ['val'];
    const options = { sharedKey, sharedState: result, depKey, keyPath, keyPaths: [keyPath], compare, format };
    const Comp = wrapSignalComp(apiCtx, options);
    return react.createElement(Comp);
  }

  // for $(val, (val)=>{/** 展开val多个子节点渲染，或渲染val本身 */})
  // for <SignalView input={()=>val} format={(val)=>...} />
  const readedInfo = getLastest();
  let isInputJustRead = false;
  let finalResult = result;
  // 传入的 mayFormat 是函数时则执行，这期间会触发收集依赖
  if (isFormatFn) {
    enableReuseLatest();
    finalResult = mayFormat(result);
    disableReuseLatest();
    isInputJustRead = true;
  }

  const { sharedKey, val, stateOrResult, depKey, keyPath, keyPaths, isDerivedResult } = readedInfo;
  if (isInputJustRead || finalResult === val || original(finalResult) === val) {
    // for $(atomDerived.val), user unbox atomDerived manually
    if (readedInfo.isDerivedAtom) {
      const Comp = wrapDerivedAtomSignalComp(apiCtx, { result: stateOrResult, compare, format });
      return react.createElement(Comp);
    }

    // for $(derived.xxx)
    if (isDerivedResult) {
      // @ts-ignore
      const Comp = wrapDerivedSignalComp(apiCtx, { result: stateOrResult, keyPath, compare, format });
      return react.createElement(Comp);
    }

    // for $(atom.val.xxx.yy) , $(shared.xxx.yy)
    if (stateOrResult) {
      const Comp = wrapSignalComp(apiCtx, { sharedKey, sharedState: stateOrResult, depKey, keyPath, keyPaths, compare, format });
      return react.createElement(Comp);
    }
  }

  return finalResult;
}

export function signal(
  apiCtx: CoreApiCtx,
  input: SingalVal | (() => SingalVal),
  mayFormat?: (val: any) => any,
  enableStatus?: boolean,
): ReactNode {
  return signalLogic(apiCtx, { input, mayFormat, enableStatus });
}

export function SignalView(props: any, ref: any) {
  const { input, format: mayFormat, enableStatus, useStatusList, ...viewProps } = props;
  mayLogNotFnError(input, 'SignalView input');
  const apiCtx = getApiCtx();
  const options = { input, mayFormat, enableStatus, useStatusList, ref, viewProps };
  return signalLogic(apiCtx, options);
}

export function BlockView(props: any, ref: any) {
  const { data: input, comp, enableStatus, useStatusList, ...viewProps } = props;
  mayLogNotFnError(input, 'BlockView data');
  // 类型上标识了 comp 必传，但实际运行如未传递 comp 则尝试使用 input 作为渲染函数
  // 此时 input 既是数据输入源，也是渲染函数
  const mayFormat = comp || input;
  const apiCtx = getApiCtx();
  const options = { input, mayFormat, enableStatus, useStatusList, ref, viewProps };
  return signalLogic(apiCtx, options);
}
