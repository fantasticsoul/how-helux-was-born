import { IMutateTaskParam, IMutateFnItem, DraftType, SharedDict } from 'helux';

/** get initial mutate state */
export function mutateStateFn() {
  return {
    a: 1,
    b: 1,
    c: 1,
    d: 1,
  };
}

export type State = ReturnType<typeof mutateStateFn>;
export type Draft = DraftType<State>;
export type MutateTaskParam<P extends any[] = any[]> = IMutateTaskParam<State, P>;
export type MutateFnItem<P extends any[] = any[]> = IMutateFnItem<SharedDict<State>, P>;