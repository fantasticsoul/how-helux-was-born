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
import { dynamicBlock, dynamicBlockWithRead } from './block';
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

const cbTypeMap: Record<string, string> = {
  'Symbol(react.forward_ref)': 'forwardRef',
  'Symbol(react.memo)': 'memo',
};

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
  return (cbTypeMap[str] || 'normal') as RenderCbType;
}

function signalLogic(apiCtx: CoreApiCtx, options: ISignalLogicOptions): ReactNode {
  const { input, mayFormat, enableStatus, ref, viewProps, useStatusList } = options;
  const { react } = apiCtx;
  if (input && (input as any)[IS_BLOCK]) {
    return react.createElement(input as any);
  }
  const compare = alwaysEqual;
  const isFormatFn = isFn(mayFormat);

  if (isFn(input)) {
    // for $(()=>atom), $(()=>derivdedAtom), $(()=>ReactNode)
    const cbType = getCbType(mayFormat);
    if (!isFormatFn && cbType === 'normal') {
      const estatus = typeof mayFormat === 'boolean' ? mayFormat : enableStatus;
      if (estatus) {
        const read = () => input();
        const Comp = dynamicBlockWithRead(apiCtx, input, { compare, read, enableStatus: true });
        return react.createElement(Comp);
      }

      const Comp = dynamicBlock(apiCtx, input, { compare, enableStatus: estatus });
      return react.createElement(Comp);
    }

    // const getProps = ()=>({ name: state.info.name, age: state.info.age });
    // const Info = (props)=><div>name:{props.name}-age{props.age}</div>;
    // for $(getProps, Info);
    // 此时 format 作为渲染函数，input 作为锁定依赖的函数，返回结果同时也会透传给渲染函数
    const renderFn: any = mayFormat;
    if (!renderFn.displayName) {
      renderFn.displayName = 'BlockViewRender';
    }
    const options = { compare, read: input, enableStatus, ref, viewProps, cbType, useStatusList };
    const Comp = dynamicBlockWithRead(apiCtx, renderFn, options);
    return react.createElement(Comp);
  }

  const format = isFormatFn ? mayFormat : noopVal;
  // for $(derivdedAtom)
  if (isDerivedAtom(input)) {
    const Comp = wrapDerivedAtomSignalComp(apiCtx, { result: input, compare, format });
    return react.createElement(Comp);
  }

  // for $(atom)
  if (isAtom(input)) {
    const sharedKey = getSharedKey(input);
    const depKey = prefixValKey('val', sharedKey);
    const keyPath = ['val'];
    const options = { sharedKey, sharedState: input, depKey, keyPath, keyPaths: [keyPath], compare, format };
    const Comp = wrapSignalComp(apiCtx, options);
    return react.createElement(Comp);
  }

  // for $(val, (val)=>{/** 展开val多个子节点渲染，或渲染val本身 */})
  const readedInfo = getLastest();
  let isInputJustRead = false;
  let finalInput = input;
  // 传入的 mayFormat 是函数时则执行，这期间会触发收集依赖
  if (isFormatFn) {
    enableReuseLatest();
    finalInput = mayFormat(input);
    disableReuseLatest();
    isInputJustRead = true;
  }

  const { sharedKey, val, stateOrResult, depKey, keyPath, keyPaths, isDerivedResult } = readedInfo;
  if (isInputJustRead || finalInput === val || original(finalInput) === val) {
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

  return finalInput;
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
  const { input, format, enableStatus, useStatusList, ...viewProps } = props;
  const apiCtx = getApiCtx();
  return signalLogic(apiCtx, { input, mayFormat: format, enableStatus, useStatusList, ref, viewProps });
}

export function BlockView(props: any, ref: any) {
  const { data, comp, enableStatus, useStatusList, ...viewProps } = props;
  const apiCtx = getApiCtx();
  return signalLogic(apiCtx, { input: data, mayFormat: comp, enableStatus, useStatusList, ref, viewProps });
}
