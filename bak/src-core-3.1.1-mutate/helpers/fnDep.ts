import { PROTO_KEY } from '../consts';
import { getFnCtx, getRunninFnCtx } from '../factory/common/fnScope';
import { getFnScope } from '../factory/common/speedup';
import type { Dict, IFnCtx } from '../types';
import { nodupPush, safeMapGet } from '../utils';
import { getInternalByKey } from './state';

/**
 * 自动记录当前正在运行的函数对 depKey 的依赖，以及 depKey 对应的函数记录
 */
export function recordFnDepKeys(
  inputDepKeys: string[],
  options: { sharedKey?: number; specificCtx?: IFnCtx | null; belongCtx?: IFnCtx; sharedState?: any },
) {
  const runningFnCtx = getRunninFnCtx();
  const fnCtx: IFnCtx | null | undefined = options.specificCtx || runningFnCtx;
  if (!fnCtx) {
    return;
  }
  const { runningSharedState, DEPKEY_FNKEYS_MAP } = getFnScope();
  const { belongCtx, sharedKey, sharedState } = options;
  if (sharedState && sharedState === runningSharedState) {
    // 因 mutate 里需要为自己重新赋值
    // 避免自己的 mutate 函数为自己收集，稍微不注意就会照成死循环
    // TODO: 如后期有需求，可删除此判断，允许同一个状态的不同值之间相互联动，但死循环后果需用户自己承担
    return;
  }

  if (sharedKey) {
    nodupPush(fnCtx.depSharedKeys, sharedKey);
  }

  if (runningFnCtx && belongCtx) {
    runningFnCtx.isFirstLevel = false;
    if (belongCtx.isAsync) {
      runningFnCtx.isAsync = true; // 传递异步标记，只要使用了异步结果，当前函数也标记为异步
    }
    const fnKey = belongCtx.fnKey;
    // 映射好上下游函数之间的关系
    nodupPush(fnCtx.prevLevelFnKeys, fnKey);
    nodupPush(belongCtx.nextLevelFnKeys, runningFnCtx.fnKey);
  }

  const { depKeys, fnKey } = fnCtx;
  inputDepKeys.forEach((depKey: string) => {
    if (PROTO_KEY === depKey) {
      return;
    }
    nodupPush(depKeys, depKey);
    const fnKeys = safeMapGet(DEPKEY_FNKEYS_MAP, depKey, []);
    nodupPush(fnKeys, fnKey);
  });
}

export function ensureFnDepData(fnCtx?: IFnCtx) {
  if (fnCtx) {
    fnCtx.depKeys.forEach((depKey: string) => recordFnDepKeys([depKey], { specificCtx: fnCtx }));
  }
}

export function recoverDep(fnCtx: IFnCtx) {
  const { FNKEY_HOOK_CTX_MAP, UNMOUNT_INFO_MAP } = getFnScope();
  const { fnKey } = fnCtx;
  FNKEY_HOOK_CTX_MAP.set(fnKey, fnCtx);

  let info = UNMOUNT_INFO_MAP.get(fnKey);
  if (info) {
    info.c = 2;
  } else {
    info = { c: 1, t: Date.now(), prev: 0 };
    UNMOUNT_INFO_MAP.set(fnKey, info);
  }

  const { c: mountCount } = info;
  if (mountCount === 2) {
    // 因为双调用导致第二次 mount，需把前一刻已触发了 unmount 行为导致的依赖丢失还原回来
    const fnCtx = getFnCtx(fnKey);
    ensureFnDepData(fnCtx);
  }
}

export function getDepSharedStateFeature(fn: IFnCtx) {
  let feature = '';
  fn.depSharedKeys.forEach((key) => {
    const ver = getInternalByKey(key)?.ver || 0;
    feature += `${ver}_`;
  });
  return feature;
}

/**
 * 获得依赖的第一层函数、异步函数
 */
export function getDepFnStats(depKey: string, runCountStats: Dict<number>) {
  const { DEPKEY_FNKEYS_MAP } = getFnScope();
  const fnKeys = DEPKEY_FNKEYS_MAP.get(depKey) || [];
  const firstLevelFnKeys: string[] = [];
  const asyncFnKeys: string[] = [];

  fnKeys.forEach((fnKey) => {
    const fnCtx = getFnCtx(fnKey);
    if (!fnCtx) return;
    if (fnCtx.isFirstLevel) {
      firstLevelFnKeys.push(fnKey);
    }
    if (fnCtx.isAsync) {
      asyncFnKeys.push(fnKey);
    }
    const count = runCountStats[fnKey]; // 每个函数将要运行的次数统计
    runCountStats[fnKey] = count === undefined ? 1 : count + 1;
  });

  return { firstLevelFnKeys, asyncFnKeys };
}

/**
 * 删除已记录的相关依赖数据
 */
export function delFnDepData(fnCtx: IFnCtx) {
  const { DEPKEY_FNKEYS_MAP } = getFnScope();
  const { depKeys, fnKey } = fnCtx;
  depKeys.forEach((key) => {
    const fnKeys = DEPKEY_FNKEYS_MAP.get(key) || [];
    const idx = fnKeys.indexOf(fnKey);
    if (idx >= 0) {
      fnKeys.splice(idx, 1);
    }
  });
}
