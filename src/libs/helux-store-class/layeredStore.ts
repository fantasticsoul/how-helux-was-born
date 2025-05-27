import { sharex, getSnap, type ISharedCtx } from 'helux';
import { extractOptions, makeWrapActions, makeWrapDerived } from './util';
import type { IDefineStoreOptions, IDefineLayeredStore } from './types';

export function defineStoreLogic(options: IDefineStoreOptions<{}, {}, {}>) {
  const { firstVerState, userGetters, userActions, stateFn } = extractOptions(true, options);
  const ctx = sharex(firstVerState) as ISharedCtx;
  const { state } = ctx;

  const { derivedState, useDerivedState } = makeWrapDerived(ctx, { userGetters, userActions }, true);
  const { wrapActions, getLoading, useLoading } = makeWrapActions(
    ctx,
    { userGetters, derived: derivedState, userActions },
    true,
  );

  return {
    getStore: () => {
      return { state: ctx.reactive, getters: derivedState, actions: wrapActions };
    },
    useState: () => {
      const [reactive] = ctx.useReactive() as unknown as [any];
      return [reactive, wrapActions];
    },
    useGetters: () => {
      const [derived] = useDerivedState();
      return derived;
    },
    getLoading,
    useLoading,
    reset: () => {
      ctx.setState(stateFn());
    },
    getSnap: (latest = true) => {
      const isPrevSnap = !latest;
      return getSnap(state, isPrevSnap);
    },
    getGettersSnap: (latest = true) => {
      return getSnap(derivedState, !latest);
    },
    state,
    reactive: ctx.reactive,
    getters: derivedState,
    actions: wrapActions,
  }
}

export const defineLayeredStore = defineStoreLogic as IDefineLayeredStore;
