// @ts-nocheck
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


declare function defineStore<
  S extends Dict,
  G extends Dict,
  A extends Dict,
>(options: {
  state: () => S,
  getters: G & ThisType<S & GettersProp<G>>,
  actions: A & ThisType<S & A & GettersProp<G>>,
}): {
  actions: A,
  useState: () => S,
  useGetters: () => GettersProp<G>,
  useLoading: () => LoadingType<A>,
  state: S,
  reactive: S,
  getLoading: () => LoadingType<A>,
};

declare function defineMergedStore<
  S extends Dict,
  G extends Dict,
  A extends Dict,
>(options: {
  state: () => S,
  getters: G & ThisType<S & GettersProp<G>>,
  actions: A & ThisType<S & A & GettersProp<G>>,
}): {
  useStore: () => S & GettersProp<G> & A,
  actions: A,
  useLoading: () => LoadingType<A>,
  state: S,
  reactive: S,
  getLoading: () => LoadingType<A>,
};

type D = Dict;
/** state entry */
type SE<S extends Dict> = { state: S };
/** dervied result entry */
type RE<R extends Dict> = { derived: R };

type EmptyDict = {};

type GetDict<D extends any> = D extends never | undefined ? EmptyDict : D;

type MergeDict<DS extends D[]> = GetDict<DS[0]> & GetDict<DS[1]> & GetDict<DS[1]>;

type MergeGetterDict<DS extends D[]> = GettersProp<GetDict<DS[0]>> & GettersProp<GetDict<DS[1]>>;

declare function withThis2<S extends D, RS extends D[], AS extends D[], L extends D>(
  state: () => S,
  derivedList: RS,
  actionsList: AS,
  last: L & ThisType<SE<S> & MergeGetterDict<RS> & MergeDict<AS> & L>,
): L

declare function withGettersThis<S extends D, RS extends D[], L extends D>(
  state: () => S,
  derivedList: RS,
  last: L & ThisType<SE<S> & MergeGetterDict<RS> & GettersProp<L>>,
): L

const someActions = {
  async minusxxx() {
    this.addxxx(1, false);
    return 3;
  },
  async addxxx(num: number, info: boolean) {
    const result = await this.minusxxx();
    return 2;
  },
  foo() {
    this.addxxx(1, true);
  },
};

const state = () => ({ num: 100, info: 'state' });

const getters = withGettersThis(state, [], {
  double() {
    return 2;
  },
  plus() {
    return 100;
  },
});

const getters2 = withGettersThis(state, [getters] as const, {
  double2() {
    const a = this.double;
    const p = this.plus
    return 2;
  },
  plus2() {
    return 100;
  },
});

const wrapActions = withThis2(state, [getters], [someActions], {
  async minus() {
    this.add(1, false);
    return 3;
  },
  async add(num: number, info: boolean) {
    const result = await this.minus();
    return 2;
  },
  foo() {
    const num = this.state.num;
    this.add(1, true);
  },
});

const wrapActions2 = withThis2(state, [{}], [wrapActions], {
  async minus2() {
    this.add(1, true);
    this.add2(1, false);
    return 3;
  },
  async add2(num: number, info: boolean) {
    const result = await this.minus();
    return 2;
  },
  foo2() {
    const num = this.state.num;
    this.add(1, true);
  },
});


const wrapActions3 = withThis2(state, [getters], [wrapActions, wrapActions2, someActions] as const, {
  async minus333() {
    this.add(1, true);
    this.add2(1, false);
    return 3;
  },

  async add333(num: number, info: boolean) {
    const result = await this.minus();
    return 2;
  },

  foo333() {
    this.add(1, true);
  },
});


const options = withOptionsThis({
  state: () => ({ num: 1 }),
  getters: {
    double() {
      return this.num + 2;
    },
    plus() {
      const a = this.double;
      return this.num + 100;
    },
  },
  actions: {
    async minus() {
      this.add(1, false);
      return 3;
    },
    async add(num: number, info: boolean) {
      const result = await this.minus();
      return 2;
    },
  },
});

const someStore = defineStore(options);

const someStore2 = defineMergedStore(options);

someStore.actions.add(1, true);

function Demo() {
  // 分层型风格
  const state = someStore.useState();
  const getters = someStore.useGetters();

  // 合并型风格
  const store = someStore2.useStore();
}

