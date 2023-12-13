import { canUseDeep } from '@helux/utils';
import { SHARED_KEY, REACTIVE_META_KEY, FROM } from '../../consts';
import { getSharedKey } from '../../helpers/state';
import { getReactiveKey } from '../common/key';
import type { From, OnOperate } from '../../types/base';
import type { IReactiveMeta } from '../../types/inner';
import type { IReactive } from '../../types/inner';
import type { TInternal } from './buildInternal';
import { REACTIVE_DESC, REACTIVE_META } from './current';

/** key: sharedKey, value: reactive object */
const reactives: Map<number, IReactive> = new Map();

function canFlush(reactive?: IReactive): reactive is IReactive {
  return !!(reactive && !reactive.expired && reactive.modified);
}

/**
 * flush modified data by finish handler
 */
function flushData(reactive: IReactive, beforeCommit?: any) {
  const { sharedKey } = reactive;
  // 标记过期，不能再被复用
  reactive.expired = true;
  // 来自于 flush 记录的 desc 值，使用过一次就清除
  const desc = REACTIVE_DESC.current(sharedKey);
  REACTIVE_DESC.del(sharedKey);
  return reactive.finish(null, { from: FROM.REACTIVE, desc, beforeCommit });
}

function getKey(shareState: any) {
  // 支持对 draftRoot 直接调用 flush
  let sharedKey = shareState && shareState[SHARED_KEY];
  if (!sharedKey) {
    sharedKey = getSharedKey(shareState);
  }
  return sharedKey;
}

/**
 * 记录修改描述，让 devtool 可观测到类似 Api_mutate@Reactive/changeA 的描述
 */
export function reactiveDesc(shareState: any, desc?: string) {
  const sharedKey = getKey(shareState);
  desc && REACTIVE_DESC.set(sharedKey, desc);
  return sharedKey;
}

/**
 * 人工触发提交响应式对象的变更数据, sharedState 可以是 draftRoot
 */
export function flush(shareState: any, desc?: string) {
  const sharedKey = getSharedKey(shareState);
  innerFlush(sharedKey, desc);
}

/**
 * 供内部调用的 flush 方法，支持透传 beforeCommit 句柄
 */
export function innerFlush(sharedKey: any, desc?: string, beforeCommit?: any) {
  const reactive = reactives.get(sharedKey);
  if (canFlush(reactive)) {
    if (desc) {
      REACTIVE_DESC.set(sharedKey, desc);
    }
    // 提交变化数据
    flushData(reactive, beforeCommit);
  }
}

/**
 * 标记响应对象已过期，再次获取时会自动刷新
 */
export function markExpired(sharedKey: number) {
  const reactive = reactives.get(sharedKey);
  if (reactive) {
    reactive.expired = true;
  }
}

/**
 * 在下一次事件循环里提交之前修改的状态，供内部发生状态变化时调用
 * 故调用此方法就会标记 reactive.modified = true
 */
export function nextTickFlush(sharedKey: number, desc?: string, beforeCommit?: any) {
  const reactive = reactives.get(sharedKey);
  if (reactive) {
    reactive.modified = true;
    reactive.nextTickFlush(desc, beforeCommit);
  }
}

/**
 * 全局独立使用或实例使用都共享同一个响应对象
 */
function getReactiveVal(internal: TInternal, forAtom: boolean) {
  const { sharedKey } = internal;
  let reactive = reactives.get(sharedKey);
  // 无响应对象、或响应对象已过期
  if (!reactive || reactive.expired) {
    const { finish, draftRoot } = internal.setStateFactory({ isReactive: true, from: FROM.REACTIVE });
    const latestReactive: IReactive = {
      finish,
      draft: draftRoot,
      expired: false,
      modified: false,
      sharedKey,
      data: [null, null],
      hasFlushTask: false,
      nextTickFlush: (desc?: string, beforeCommit?: any) => {
        const { expired, hasFlushTask } = latestReactive;
        if (!expired) {
          latestReactive.data = [desc, beforeCommit];
        }
        if (!hasFlushTask) {
          latestReactive.hasFlushTask = true;
          // push flush cb to micro task
          Promise.resolve().then(() => {
            const [desc, beforeCommit] = latestReactive.data;
            innerFlush(sharedKey, desc, beforeCommit);
          });
        }
      },
    };
    reactive = latestReactive;
    reactives.set(sharedKey, latestReactive);
  }
  const { draft } = reactive;
  return forAtom ? draft.val : draft;
}

/**
 * 创建全局使用的响应式共享对象
 */
export function buildReactive(
  internal: TInternal,
  depKeys: string[],
  options?: { desc?: string, onRead?: OnOperate, from?: From, isFromCb?: boolean }
) {
  // 提供 draftRoot draft，和 mutate 回调里对齐，方便用户使用 atom 时少一层 .val 操作
  let draftRoot: any = {};
  let draft: any = {};
  const { rawState, deep, forAtom, isPrimitive, sharedKey, moduleName } = internal;
  const { desc, onRead, from = FROM.REACTIVE, isFromCb = false } = options || {};

  const rKey = getReactiveKey();
  console.error(`gen rKey `, rKey, from);
  const meta: IReactiveMeta = { moduleName, key: rKey, desc: desc || '', sharedKey, depKeys, onRead, from, isFromCb };
  if (canUseDeep(deep)) {
    const set = (forAtom: boolean, key: any, value: any) => {
      const draftVal = getReactiveVal(internal, forAtom);
      isFromCb && REACTIVE_META.markUsing(rKey);
      // handleOperate 里会自动触发 nextTickFlush
      draftVal[key] = value;
      return true;
    };
    const get = (forAtom: boolean, key: any) => {
      if (key === REACTIVE_META_KEY) {
        return meta;
      }
      isFromCb && REACTIVE_META.markUsing(rKey);
      const draftVal = getReactiveVal(internal, forAtom);
      return draftVal[key];
    };

    draftRoot = new Proxy(rawState, {
      set: (t: any, key: any, value: any) => set(false, key, value),
      get: (t: any, key: any) => get(false, key),
    });
    draft = draftRoot;
    if (forAtom) {
      draft = isPrimitive
        ? rawState.val
        : new Proxy(rawState, {
          set: (t: any, key: any, value: any) => set(true, key, value),
          get: (t: any, key: any) => get(true, key),
        });
    }
  } else {
    draftRoot = rawState;
    draft = rawState.val;
  }
  REACTIVE_META.set(meta.key, meta);

  return { draftRoot, draft, meta };
}
