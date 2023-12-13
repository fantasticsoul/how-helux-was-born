import { getVal, isDebug, isFn, isMap, isObj, isProxyAvailable, noop, prefixValKey } from '@helux/utils';
import { immut, IOperateParams, limuUtils } from 'limu';
import { ARR, KEY_SPLITER, MAP, STATE_TYPE, FROM } from '../../consts';
import { createOb } from '../../helpers/obj';
import type { From, Dict, IInnerSetStateOptions, NumStrSymbol, TriggerReason } from '../../types/base';
import { DepKeyInfo } from '../../types/inner';
import type { TInternal } from '../creator/buildInternal';

const { USER_STATE } = STATE_TYPE;
const { SET_STATE } = FROM;
const fakeGetReplaced = () => ({ isReplaced: false, replacedValue: null as any });
export interface IMutateCtx {
  /**
   * 为 shared 记录一个第一层的 key 值，用于刷新 immut 生成的 代理对象，
   * 刷新时机和具体解释见 factory/creator/commitState 逻辑
   */
  level1Key: string;
  /** 当次变更的依赖 key 列表，在 finishMutate 阶段会将 writeKeys 字典keys 转入 depKeys 里 */
  depKeys: string[];
  /**
   * 由 setStateOptions.extraDep 记录的需要强制更新的依赖 key，这些 key 只复制更新实例，不涉及触发 watch/derive 变更流程
   */
  forcedDepKeys: string[];
  triggerReasons: TriggerReason[];
  ids: NumStrSymbol[];
  globalIds: NumStrSymbol[];
  writeKeys: Dict;
  /**
   * 记录读过的 key，用于提前发现 mutate 里 draft.a+=1 时回导致死循环情况出现，并提示用户
   */
  readKeys: Dict;
  arrKeyDict: Dict;
  writeKeyPathInfo: Dict<TriggerReason>;
  /**
   * default: true
   * 是否处理 atom setState((draft)=>xxx) 返回结果xxx，
   * 目前规则是修改了 draft 则 handleAtomCbReturn 被会置为 false，
   * 避免无括号写法 draft=>draft.xx = 1 隐式返回的结果 1 被写入到草稿，
   * 备注：安全写法应该是draft=>{draft.xx = 1}
   */
  handleAtomCbReturn: boolean;
  /** 为 atom 记录的 draft.val 引用 */
  draftVal: any;
  from: From;
  isReactive: boolean;
  /** mutate fn 函数里收集到的导致死循环的 keys，通常都是 draft.a+=1 操作导致 */
  fnDeadCycleKeys: string[];
  /** mutate task 函数里收集到的导致死循环的 keys，通常都是依赖 a 变化驱动 task 执行，task 里又修改了 a 导致 */
  taskDeadCycleKeys: string[];
  /**
   * default: false
   * 由 IInnerSetStateOptions 透传而来
   * 目前仅 mutate fn 函数提供的 draft 对象支持依赖收集，其他场景都禁止收集，避免收集到造成死循环的依赖
   * 例如立即执行的watch watch(()=>{ setState(draft=> ...) })
   * 同时也减少不必要的运行时分析性能损耗
   */
  enableDraftDep: boolean;
}

// for hot reload of buildShared
/**
 * 考虑到有伴生状态的存在，这里取6
 */
export function tryGetLoc(moduleName: string, endCutIdx = 8) {
  let loc = '';
  if (isDebug() && moduleName) {
    try {
      throw new Error('loc');
    } catch (err: any) {
      const arr = err.stack.split('\n');
      const pureArr = arr.map((codeLoc: string) => {
        return codeLoc.substring(0, codeLoc.indexOf('(')).trim();
      });
      loc = pureArr.slice(4, endCutIdx).join(' -> ');
    }
  }
  return loc;
}

export function newMutateCtx(options: IInnerSetStateOptions): IMutateCtx {
  const { ids = [], globalIds = [], isReactive = false, from = SET_STATE, enableDraftDep = false } = options; // 用户 setState 可能设定了 ids globalIds
  return {
    level1Key: '',
    depKeys: [],
    forcedDepKeys: [],
    triggerReasons: [],
    ids,
    globalIds,
    readKeys: {},
    writeKeys: {},
    arrKeyDict: {}, // 记录读取过程中遇到的数组 key
    writeKeyPathInfo: {},
    handleAtomCbReturn: true,
    draftVal: null,
    from,
    isReactive,
    fnDeadCycleKeys: [],
    taskDeadCycleKeys: [],
    enableDraftDep,
  };
}

export function newOpParams(key: string, value: any, isChanged = true): IOperateParams {
  return {
    isChanged,
    op: 'set',
    immutBase: false,
    key,
    value,
    proxyValue: value,
    parentType: 'Object',
    keyPath: [],
    fullKeyPath: [key],
    isBuiltInFnKey: false,
    replaceValue: noop,
    getReplaced: fakeGetReplaced,
  };
}

export function getDepKeyInfo(depKey: string): DepKeyInfo {
  const [sharedKey, rest] = depKey.split('/');
  const keyPath = rest.split(KEY_SPLITER);
  return { sharedKey: Number(sharedKey), keyPath, depKey };
}

/** 获取根值依赖 key 信息 */
export function getRootValDepKeyInfo(internal: TInternal) {
  const { sharedKey, forAtom } = internal;
  // deps 列表里的 atom 结果自动拆箱
  const suffix = forAtom ? '/val' : '';
  const keyPath = forAtom ? ['val'] : [];
  return { depKey: `${sharedKey}${suffix}`, keyPath, sharedKey };
}

export function getDepKeyByPath(fullKeyPath: string[], sharedKey: number) {
  return prefixValKey(fullKeyPath.join(KEY_SPLITER), sharedKey);
}

export function isValChanged(internal: TInternal, depKey: string) {
  const { snap, prevSnap, stateType } = internal;
  // 非用户状态，都返回 true（伴生状态有自己的key规则）
  if (USER_STATE !== stateType) {
    return true;
  }

  const { keyPath } = getDepKeyInfo(depKey);
  try {
    const currVal = getVal(snap, keyPath);
    const prevVal = getVal(prevSnap, keyPath);
    return currVal !== prevVal;
  } catch (err: any) {
    // 结构变异，出现了 read property of undefined 错误，返回值已变更，
    // 让函数执行报错且此错误由用户自己承担
    return true;
  }
}

export function createImmut(obj: Dict, onOperate: (op: IOperateParams) => void) {
  if (isProxyAvailable()) {
    return immut(obj, { onOperate });
  }

  return createOb(obj, {
    get(target, key) {
      const val = target[key];
      const op = newOpParams(key, val, false);
      onOperate(op);
      return val;
    },
  });
}

/**
 * 区分是 atom 还是 shared 返回的部分状态，atom 返回要自动装箱为 { val: T }
 */
export function wrapPartial(forAtom: boolean, val: any) {
  if (val === undefined) return; // undefined 丢弃，如真需要赋值 undefined，调用 setAtomVal
  if (forAtom) return { val };
  if (isObj(val)) return val;
}

/**
 * 处理 setState(()=>({...})) 和 setState({...}) 两种情况返回的部分状态
 */
export function runPartialCb(forAtom: boolean, mayCb: any, draft: any) {
  const val = !isFn(mayCb) ? mayCb : mayCb(draft);
  return wrapPartial(forAtom, val);
}

export function callOnRead(opParams: IOperateParams, onRead: any) {
  let { value } = opParams;
  // 触发用户定义的钩子函数
  if (onRead) {
    onRead(opParams);
    const { replacedValue, isReplaced } = opParams.getReplaced();
    if (isReplaced) {
      value = replacedValue;
    }
  }
  return value;
}

export function isArrLike(parentType?: string) {
  // @ts-ignore
  return [ARR, MAP].includes(parentType);
}

export function isArrLikeVal(val: any) {
  return Array.isArray(val) || isMap(val);
}

export const { isObject: isDict } = limuUtils;
