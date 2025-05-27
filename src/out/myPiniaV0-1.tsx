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

type SpecialDict = { __fot_type_infer__: 666 };

export declare function defineStore<P extends Dict = SpecialDict>(): <
  S extends Dict,
  D extends Dict<Fn>,
  A extends Dict<Fn>,
>(
  options: {
    state: S;
    derived?: OptionDerivedType<S, D>;
    // actions?: P extends undefined | void ? { a: number } : {
    //   // [K in keyof A]: (params: IActionTaskParams<S, K extends keyof P ? P[K] : 222> & { payloadWrap: P }) => any;
    //   [K in keyof P]: (params: { draft: S, payload: K extends keyof P ? P[K] : 222, payloadWrap: any }) => any;
    // };
    actions?: P extends SpecialDict ? A
    : {
      [K in keyof P]: (params: { draft: S, payload: K extends keyof P ? P[K] : 222 }) => any;
    } & {
      [K in string]: (params: { draft: S, payload: any | void }) => any
    };
    lifecycle?: ILifecycle;
    stateOptions?: IStateOptions<S>;
    derivedOptions?: IStateOptions;
    moduleName?: string;
  },
) => {
  useState: () => [state: S, setState: SetState<S>, renderInfo: IRenderInfo<S>];
  useDerived: () => DerivedType<D>;
  useLoading: () => LoadingType<A>;
  actions: P extends SpecialDict ? {
    [K in keyof A]: (payload?: any) => ReturnType<A[K]>;
  } : {
    [K in keyof P]: (payload: P[K]) => K extends keyof A ? ReturnType<A[K]> : any;
  };
  state: S;
  reactive: S;
  getLoading: () => LoadingType<A>;
};


type Payloads = { add: number, minus: boolean, test: 1 | void };
const store = defineStore<Payloads>()({
  state: { num: 1, isShow: true },
  derived: {
    plus({ state }) { return state.num + 1 },
  },
  actions: {
    add({ draft, payload }) {
      draft.isShow = true;
      console.log(payload);
      return 1;
    },
    minus({ draft, payload }) {
      draft.isShow = true;
      return 1;
    },
    test({ draft, payload }) {
      console.log('gogo');
      return 1;
    }
  },
});

const { useState, useLoading, useDerived, actions } = store;

function Demo() {
  actions.add(1);
  actions.test();
  const [state] = useState();
  const ld = useLoading();
  const derived = useDerived();
  const { plus } = derived;
  const addFnLoading = ld.add;
  const isShow = state.isShow;
  console.log(plus, addFnLoading, isShow);
}
