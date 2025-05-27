import { sharex } from 'helux';
import type { IDefineStoreOptions } from './types';

export function defineStore(options: IDefineStoreOptions<{}, {}, {}>) {
  const { state, getters = {}, actions = {} } = options;
  const userGetters: any = getters;
  const userActions: any = actions;

  const ctx = sharex(state);
  const sharedState: any = ctx.state;

  const initDerived: any = {};
  const deriveFns: any = {};
  Object.keys(getters).forEach((key) => {
    initDerived[key] = undefined;
    deriveFns[key] = (draft: any) => {
      draft[key] = userGetters[key](sharedState);
    };
  });
  const dm = ctx.defineMutateDerive(initDerived)(deriveFns);

  const actionFns: any = {};
  Object.keys(actions).forEach((key) => {
    actionFns[key] = ({ draft, payload }: any) => {
      const fn = userActions[key].bind(wrapStore);
      fn(payload);
    };
  });
  const { actions: wrapActions } = ctx.defineActions()(actionFns);

  const wrapStore = new Proxy({}, {
    get(t: any, p: any) {
      if (p in sharedState) {
        return sharedState[p];
      }
      if (p in userGetters) {
        return dm.derivedState[p];
      }
      if (p in userActions) {
        const fn = wrapActions[p];
        return fn;
      }
      return t[p];
    },
    set() {
      console.warn('can not set');
      return false;
    },
  });

  return {
    useStore: () => {
      const [reactive] = ctx.useReactive() as unknown as [any];
      const [derived] = dm.useDerivedState();

      return new Proxy({} as any, {
        get(t: any, p: any) {
          if (p in reactive) {
            return reactive[p];
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
        set() {
          console.warn('can not set');
          return false;
        },
      });
    },
    actions: wrapActions,
  }
}