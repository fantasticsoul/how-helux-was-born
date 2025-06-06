import type { IActionTaskParams, Dict, Fn, LoadingStatus, ICreateOptionsFull, ILifecycle, SetState, IRenderInfo } from 'helux';


// 约束返回给用户使用的 loading 类型
export type LoadingType<A extends Dict = any> = { [K in keyof A]: LoadingStatus };
// 约束返回给用户使用的 actions 类型
export type ActionsType<A extends Dict = any, P extends Dict = Dict> = {
  [K in keyof A]: (payload: K extends keyof P ? P[K] : any) => ReturnType<A[K]>;
};
// 约束返回给用户使用的 derived 类型
export type DerivedType<D extends Dict = any> = {
  [K in keyof D]: ReturnType<D[K]>;
};

// 问题在这里，要不要判断后展开 A，判断后展开了 actions 定义里的 P[K] 读不到类型，返回给用户的 actions 有类型
// 不判断展开 actions 定义里的 P[K] 可读到类型，但返回给用户的 actions 无类型
// 约束 defineStore options.actions 类型
export type OptionActionsType<
  S extends Dict = any,
  A extends Dict = any,
  P extends Dict = any,
  A2 extends Dict = A,
> = A extends Dict
  ? {
    [K in keyof A2]: (params: IActionTaskParams<S, K extends keyof P ? P[K] : any> & { payloadWrap: P }) => any;
  }
  : A2;
// > = {
//     [K in keyof A2]: (params: IActionTaskParams<S, K extends keyof P ? P[K] : any> & { payloadWrap: P }) => any;
//   }

// export type OptionActionsType<S extends Dict = any, A extends Dict = any, P extends Dict = any> = {
//   [K in keyof A]: (params: IActionTaskParams<S, K extends keyof P ? P[K] : any>) => any;
// }


// 约束 defineStore options.derived 类型
export type OptionDerivedType<S extends Dict = any, D extends Dict = any> = D extends Dict
  ? {
    [K in keyof D]: (params: { state: S, getDerived: () => { [K in keyof D]: any } }) => any;
  }
  : D;

export type IStateOptions<T = any> = Omit<ICreateOptionsFull<T>, 'moduleName' | 'deep' | 'mutate' | 'mutateList' | 'enableMutate'>;

// 约束 defineStore options 类型
export interface IDefineStoreOptions<
  S extends Dict = any,
  D extends Dict = any,
  A extends Dict = any,
  P extends Dict = any,
> {
  state: S;
  derived?: OptionDerivedType<S, D>;
  actions?: OptionActionsType<S, A, P, A>;
  lifecycle?: ILifecycle;
  stateOptions?: IStateOptions<S>;
  derivedOptions?: IStateOptions;
  moduleName?: string;
}

export declare function defineStore<P extends Dict = Dict>(): <
  S extends Dict = Dict,
  D extends Dict<Fn> = Dict<Fn>,
  A extends Dict<Fn> = Dict<Fn>,
>(
  options: IDefineStoreOptions<S, D, A, P>,
) => {
  useState: () => [state: S, setState: SetState<S>, renderInfo: IRenderInfo<S>];
  useDerived: () => DerivedType<D>;
  useLoading: () => LoadingType<A>;
  actions: ActionsType<A, P>;
  state: S;
  reactive: S;
  getLoading: () => LoadingType<A>;
};


type Payloads = { add: number, minus: boolean };
const store = defineStore<Payloads>()({
  state: { num: 1, isShow: true },
  derived: {
    plus({ state }) { return state.num + 1 },
  },
  actions: {
    add({ draft, payloadWrap: { add: payload } }) {
      draft.isShow = true;
      console.log(payload);
    },
    minus({ draft, payload }) {
      draft.isShow = true;
    },
  },
});

const { useState, useLoading, useDerived, actions } = store;

function Demo() {
  actions.add(1);
  const [state] = useState();
  const ld = useLoading();
  const derived = useDerived();
  const { plus } = derived;
  const addFnLoading = ld.add;
  const isShow = state.isShow;
  console.log(plus, addFnLoading, isShow);
}
