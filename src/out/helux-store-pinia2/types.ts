import type { Dict, LoadingStatus } from 'helux';

/** 将 getters 函数转为 getters 属性 */
export type GettersProp<G extends Dict> = {
  readonly [K in keyof G]: G[K] extends (...args: any[]) => infer R ? R : any;
}

// 约束返回给用户使用的 loading 类型
export type LoadingType<A extends Dict = any> = { [K in keyof A]: LoadingStatus };

declare function withOptionsThis<
  S extends Dict,
  G extends Dict,
  A extends Dict,
>(options: {
  state: () => S,
  getters: G & ThisType<S & GettersProp<G>>,
  actions: A & ThisType<S & A & GettersProp<G>>,
}): {
  state: () => S,
  getters: G & ThisType<S & GettersProp<G>>,
  actions: A & ThisType<S & A & GettersProp<G>>,
};


export interface IDefineStoreOptions<S extends Dict, G extends Dict, A extends Dict> {
  state: () => S,
  getters?: G & ThisType<S & GettersProp<G>>,
  actions?: A & ThisType<S & A & GettersProp<G>>,
}

export interface IDefineStore {
  <S extends Dict, G extends Dict, A extends Dict>(options: {
    state: () => S,
    getters?: G & ThisType<S & GettersProp<G>>,
    actions?: A & ThisType<S & A & GettersProp<G>>,
  }): {
    actions: A,
    useState: () => S,
    useGetters: () => GettersProp<G>,
    useLoading: () => LoadingType<A>,
    state: S,
    reactive: S,
    getLoading: () => LoadingType<A>,
  }
};


type D = Dict;
/** state entry */
type SE<S extends Dict> = { state: S };

type EmptyDict = {};

type GetDict<D extends any> = D extends never | undefined ? EmptyDict : D;

type MergeDict<DS extends D[]> = GetDict<DS[0]> & GetDict<DS[1]> & GetDict<DS[1]>;

type MergeGetterDict<DS extends D[]> = GettersProp<GetDict<DS[0]>> & GettersProp<GetDict<DS[1]>>;

export declare function withThis<S extends D, RS extends D[], AS extends D[], L extends D>(
  state: () => S,
  derivedList: RS,
  actionsList: AS,
  last: L & ThisType<SE<S> & MergeGetterDict<RS> & MergeDict<AS> & L>,
): L

export declare function withGettersThis<S extends D, RS extends D[], L extends D>(
  state: () => S,
  derivedList: RS,
  last: L & ThisType<SE<S> & MergeGetterDict<RS> & GettersProp<L>>,
): L
