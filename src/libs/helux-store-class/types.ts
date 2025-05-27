import type { Dict, LoadingStatus } from 'helux';

type D = Dict;

type EmptyDict = {};

type StateWrap<T extends Dict> = { state: T };

type GetDict<D extends any> = D extends never | undefined ? EmptyDict : D;

// 合并多个 actions 到一个字典，目前暂定只匹配前6个
type MergeActions<AS extends D[]> =
  GetDict<AS[0]>
  & GetDict<AS[1]>
  & GetDict<AS[2]>
  & GetDict<AS[3]>
  & GetDict<AS[4]>
  & GetDict<AS[5]>
  & GetDict<AS[6]>;

// 合并多个 getters 到一个字典，目前暂定只匹配前6个
type MergeGetters<GS extends D[]> =
  GettersProp<GetDict<GS[0]>>
  & GettersProp<GetDict<GS[1]>>
  & GettersProp<GetDict<GS[2]>>
  & GettersProp<GetDict<GS[3]>>
  & GettersProp<GetDict<GS[4]>>
  & GettersProp<GetDict<GS[5]>>
  & GettersProp<GetDict<GS[6]>>;

/** 将 getters 函数转为 getters 属性 */
export type GettersProp<G extends Dict> = {
  readonly [K in keyof G]: G[K] extends (...args: any[]) => infer R ? R : any;
}

// 约束返回给用户使用的 loading 类型
export type LoadingType<A extends Dict = any> = { [K in keyof A]: LoadingStatus };

export declare function withOptionsThis<
  S extends Dict,
  G extends Dict,
  A extends Dict,
>(options: {
  state: (() => S) | S,
  getters: G & ThisType<S & GettersProp<G>>,
  actions: A & ThisType<S & A & GettersProp<G>>,
}): {
  state: (() => S) | S,
  getters: G & ThisType<S & GettersProp<G>>,
  actions: A & ThisType<S & A & GettersProp<G>>,
}

export declare function withThis<S extends D, GS extends D[], AS extends D[], L extends D>(
  state: (() => S) | S,
  gettersList: GS,
  actionsList: AS,
  last: L & ThisType<S & MergeGetters<GS> & MergeActions<AS> & L>,
): L

export declare function withGettersThis<S extends D, GS extends D[], L extends D>(
  state: (() => S) | S,
  gettersList: GS,
  last: L & ThisType<S & MergeGetters<GS> & GettersProp<L>>,
): L

export declare function withLayeredOptionsThis<
  S extends Dict,
  G extends Dict,
  A extends Dict,
>(options: {
  state: (() => S) | S,
  getters: G & ThisType<StateWrap<S> & GettersProp<G>>,
  actions: A & ThisType<StateWrap<S> & A & GettersProp<G>>,
}): {
  state: (() => S) | S,
  getters: G & ThisType<StateWrap<S> & GettersProp<G>>,
  actions: A & ThisType<StateWrap<S> & A & GettersProp<G>>,
}

export declare function withLayeredThis<S extends D, GS extends D[], AS extends D[], L extends D>(
  state: (() => S) | S,
  gettersList: GS,
  actionsList: AS,
  last: L & ThisType<StateWrap<S> & MergeGetters<GS> & MergeActions<AS> & L>,
): L

export declare function withLayeredGettersThis<S extends D, GS extends D[], L extends D>(
  state: (() => S) | S,
  gettersList: GS,
  last: L & ThisType<StateWrap<S> & MergeGetters<GS> & GettersProp<L>>,
): L

export interface IDefineStoreOptions<S extends Dict, G extends Dict, A extends Dict> {
  state: (() => S) | S,
  getters?: G & ThisType<S & GettersProp<G>>,
  actions?: A & ThisType<S & A & GettersProp<G>>,
}

export interface IDefineStore {
  <S extends Dict, G extends Dict, A extends Dict>(options: IDefineStoreOptions<S, G, A>): {
    getStore: () => S & GettersProp<G> & A,
    useStore: () => S & GettersProp<G> & A,
    useLoading: () => LoadingType<A>,
    getLoading: () => LoadingType<A>,
    getSnap: () => S & GettersProp<G>,
    getGettersSnap: () => S & GettersProp<G>,
    reset: () => void;
    state: S,
    getters: GettersProp<G>,
    reactive: S,
    actions: A,
  }
}

export interface IDefineLayeredStoreOptions<S extends Dict, G extends Dict, A extends Dict> {
  state: (() => S) | S,
  getters?: G & ThisType<StateWrap<S> & GettersProp<G>>,
  actions?: A & ThisType<StateWrap<S> & A & GettersProp<G>>,
}

export interface IDefineLayeredStore {
  <S extends Dict, G extends Dict, A extends Dict>(options: IDefineLayeredStoreOptions<S, G, A>): {
    getStore: () => {
      state: S,
      getters: GettersProp<G>,
      actions: A,
    },
    useState: () => [S, A],
    useGetters: () => GettersProp<G>,
    useLoading: () => LoadingType<A>,
    getLoading: () => LoadingType<A>,
    getSnap: () => S,
    getGettersSnap: () => GettersProp<G>,
    reset: () => void;
    state: S,
    getters: GettersProp<G>,
    reactive: S,
    actions: A,
  }
}
