import type { ISharedCtx, Fn } from 'helux';

export function extractOptions(isLayered: boolean, options: any) {
  const { state: stateOrFn, getters = {}, actions = {} } = options;
  let stateFn = stateOrFn;
  if (typeof stateOrFn !== 'function') {
    stateFn = () => stateOrFn;
  }

  const firstVerState: any = stateFn();
  const userGetters: any = getters;
  const userActions: any = actions;

  if (!isLayered) {
    // 是合并型 store，则把 getters 里的 key 赋值到第一版 state 里
    Object.keys(userGetters).forEach((key) => {
      firstVerState[key] = undefined;
    });
  }

  return { stateFn, firstVerState, userGetters, userActions };
}

export function makeWrapStore(state: any, options: any, isLayered?: boolean) {
  const { userGetters, derived, userActions, wrapActions } = options;
  const wrapStore = new Proxy({}, {
    get(t: any, p: any) {
      // state 独立存放
      if (isLayered && p === 'state') {
        return state;
      }

      if (p in state) {
        return state[p];
      }
      if (p in userGetters) {
        return derived[p];
      }
      if (p in userActions) {
        const fn = wrapActions[p];
        return fn;
      }
      return t[p];
    },
    set(t: any, p: any, v: any) {
      if (p in state) {
        state[p] = v;
        return true;
      }
      console.warn('can not set');
      return false;
    },
  });
  return wrapStore;
}

export function makeWrapActions(ctx: ISharedCtx, options: any, isLayered?: boolean) {
  const { userActions, userGetters, derived } = options;
  const actionFns: any = {};
  let wrapActions: any = {};
  Object.keys(userActions).forEach((key) => {
    actionFns[key] = ({ draft, payload }: any) => {
      const wrapStore = makeWrapStore(draft, { userGetters, derived, userActions, wrapActions }, isLayered);
      const fn = userActions[key].bind(wrapStore);
      return fn.apply(null, payload);
    };
  });
  const { actions, getLoading, useLoading } = ctx.defineActions(false, true)(actionFns);
  wrapActions = actions;
  return { wrapActions: actions, getLoading, useLoading };
}

export function makeWrapDerived(
  ctx: ISharedCtx,
  options: any,
  isLayered?: boolean,
): { derivedState: any, useDerivedState: Fn } {
  const { userGetters, userActions } = options;
  const { state } = ctx;
  const initDerived: any = {};
  const deriveFns: any = {};

  if (!isLayered) {
    Object.keys(userGetters).forEach((key) => {
      deriveFns[key] = (draft: any) => {
        const wrapStore = makeWrapStore(draft, { userGetters, derived: draft, userActions, wrapActions: {} });
        const fn = userGetters[key].bind(wrapStore);
        draft[key] = fn(draft);
      };
    });
    ctx.defineMutateSelf()(deriveFns);
    // 未分层结构是用 state 当 derived，因为是基于自身可变计算的派生属性
    return { derivedState: state, useDerivedState: () => { } };
  }

  Object.keys(userGetters).forEach((key) => {
    initDerived[key] = undefined;
    deriveFns[key] = (draft: any) => {
      // 绑定 ctx.state 给 actions 函数操作, 提供 draft 给用户，是 getters 里 g2 依赖 g1 的计算也能正常收集到依赖
      const wrapStore = makeWrapStore(state, { userGetters, derived: draft, userActions, wrapActions: {} }, isLayered);
      const fn = userGetters[key].bind(wrapStore);
      draft[key] = fn(state);
    };
  });
  const dm = ctx.defineMutateDerive(initDerived)(deriveFns);

  return { derivedState: dm.derivedState, useDerivedState: dm.useDerivedState };
}
