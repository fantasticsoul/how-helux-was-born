import { defineStore } from '@helux/store-pinia';
// import { defineStore } from '@helux/store-pinia';

interface IBook {
  id: string;
  name: string;
  price: number;
}

const delay = (ms = 1000) => new Promise(r => setTimeout(r, ms));
export const storeCtx = defineStore('DefineStoreDemo', {
  state: () => ({
    list: [] as IBook[], page: 1, size: 10,
    total: 221,
    mountCount: 0,
    time: 0,
    a: 1,
    b: 2,
    c: 3,
    d: 4,
  }),
  getters: {
    // 由 state 派生出 totalPlus，上游依赖不变化时此函数不再重复计算
    totalPlus() {
      return this.total + 1;
    },
    // 由其他 getters 派生出 totalPlus2，上游依赖不变化时此函数不再重复计算
    totalPlus2() {
      return this.totalPlus + 100;
    },
  },
  actions: {
    // 同步方法
    changeTotal(payload: number) {
      this.total = payload;
    },
    async otherFn(test?: number, test2?: number) {
      await delay(); // ❌ <--- 此处之前无变更，故不会提交
      this.a = Date.now();
      await delay(); // ✅ <--- 在此之前有数据变更，触发提交
      this.b = Date.now();
      await delay(); // ✅<--- 在此之前有数据变更，触发提交
      this.c = Date.now();
      // ✅<--- 结束 action，在此之前有数据变更，触发提交
    },
    // 异步方法
    async fetchList(payload: { page: number, size: number }, p2: number) {
      console.log('START fetchList', payload.page, payload.size);
      await delay(); // ❌ <--- 此处之前无变更，故不会提交
      this.a = Date.now();
      await delay(); // <--- ✅ 在此之前有数据变更，触发提交
      this.b = Date.now();
      await delay(); // <--- ✅ 在此之前有数据变更，触发提交
      this.c = Date.now();
      await delay(); // <--- ✅ 在此之前有数据变更，触发提交
      await this.otherFn(111, 222);
      const { list, total } = await Promise.resolve({
        list: [
          { id: '1', name: `state_${Date.now()}`, price: 100 },
          { id: '2', name: `helex_${Date.now()}`, price: 100 },
        ],
        total: 10,
      });
      this.list = list;
      this.total = total;
      console.log('End fetchList', payload.page, payload.size);
      // ✅<--- 结束 action，在此之前有数据变更，触发提交
    },
    throwFn() {
      throw new Error('xxx');
    },
    testCatch() {
      try {
        this.throwFn();
      } catch (err) {
        console.log('-------->', err);
      }
    },
  },
  // lifecycle 方法在 actions 里是访问不到的，由框架负责调用
  lifecycle: {
    mounted() {
      this.mountCount += 1;
    },
    afterCommit(params) {
      // console.log('afterCommit', params);
    },
    beforeCommit(params) {
      // console.log('beforeCommit', params);
      params.draft.time = Date.now();
    },
  },
});