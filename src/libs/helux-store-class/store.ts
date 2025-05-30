import { sharex, getSnap, type ISharedCtx } from 'helux';
import type { IDefineStoreOptions, IDefineStore } from './types';
import { makeWrapStore, makeWrapActions, makeWrapDerived, extractOptions } from './util';

export function defineStoreLogic(options: IDefineStoreOptions<{}, {}, {}>) {
  const { firstVerState, userGetters, userActions, stateFn } = extractOptions(false, options);
  const ctx = sharex(firstVerState) as ISharedCtx;
  const { state } = ctx;
  const { derivedState } = makeWrapDerived(ctx, { userGetters, userActions });
  // 未分层结构是用 state 当 derived，因为是基于自身可变计算的派生属性
  const { wrapActions, getLoading, useLoading } = makeWrapActions(ctx, { userGetters, derived: derivedState, userActions });

  return {
    getStore: () => {
      // 绑定顶层 reactive 给 actions 函数或 store自身操作
      return makeWrapStore(ctx.reactive, { userGetters, derived: ctx.reactive, userActions, wrapActions })
    },
    useStore: () => {
      const [reactive] = ctx.useReactive() as unknown as [any];
      // 绑定 reactive 给 actions 函数或 store自身操作
      const wrapStore = makeWrapStore(reactive, { userGetters, derived: reactive, userActions, wrapActions });
      return wrapStore;
    },
    getLoading,
    useLoading,
    reset: () => {
      ctx.setState(stateFn());
    },
    getSnap: (latest = true) => {
      return getSnap(state, !latest);
    },
    getGettersSnap: (latest = true) => {
      return getSnap(state, !latest);
    },
    state,
    reactive: ctx.reactive,
    getters: state,
    actions: wrapActions,
  }
}

export const defineStore = defineStoreLogic as IDefineStore;
