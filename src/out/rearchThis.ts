import type { Dict, LoadingStatus } from 'helux';

/** 将 getters 函数转为 getters 属性 */
export type GettersProperty<G extends Dict> = {
  readonly [K in keyof G]: G[K] extends (...args: any[]) => infer R ? R : any;
}

// 约束返回给用户使用的 loading 类型
export type LoadingType<A extends Dict = any> = { [K in keyof A]: LoadingStatus };

declare function defineStore<
  S extends Dict,
  G extends Dict,
  A extends Dict,
>(options: {
  state: () => S,
  getters: G & ThisType<S & GettersProperty<G>>,
  actions: A & ThisType<S & A & GettersProperty<G>>,
}): {
  actions: A,
  useState: () => S,
  useGetters: () => GettersProperty<G>,
  useLoading: () => LoadingType<A>,
  state: S,
  reactive: S,
  getLoading: () => LoadingType<A>,
};

const store = defineStore({
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

store.actions.add(1, true);