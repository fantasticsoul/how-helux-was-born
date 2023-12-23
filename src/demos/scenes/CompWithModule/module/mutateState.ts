import { UnconfirmedArg, IMutateTaskParam, IMutateFnItem, DraftType } from 'helux';

export function getInitialMutateState() {
  return {
    a: 1,
    b: 1,
    c: 1,
    d: 1,
  };
}

export type State = ReturnType<typeof getInitialMutateState>;
export type Draft = DraftType<State>;
export type MutateTaskParam<P = UnconfirmedArg> = IMutateTaskParam<State, P>;
export type MutateFnItem<P = UnconfirmedArg> = IMutateFnItem<State, P>;