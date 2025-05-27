/**
 * https://codesandbox.io/p/sandbox/helux-best-practice-9qds9x?file=%2Fsrc%2FLikePinia.tsx
 */
import React from 'react';
import { $ } from 'helux';
import { defineStore, defineLayeredStore } from '@helux/store-pinia';
// import { defineStore } from '@helux/store-pinia';

interface IBook {
  id: string;
  name: string;
  price: number;
}

const delay = (ms = 1000) => new Promise(r => setTimeout(r, ms));


const storeCtx = defineStore('BookStore', {
  state: () => ({
    list: [] as IBook[], page: 1, size: 10, total: 8, mountCount: 0,
    time: 0,
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
    // 异步方法
    async fetchList(payload: { page: number, size: number }, p2: number) {
      console.log(payload.page, payload.size);
      await delay();
      const { list, total } = await Promise.resolve({
        list: [
          { id: '1', name: `state_${Date.now()}`, price: 100 },
          { id: '2', name: `helex_${Date.now()}`, price: 100 },
        ],
        total: 10,
      });
      this.list = list;
      this.total = total;
    },
  },
  // lifecycle 方法在 actions 里是访问不到的，由框架负责调用
  lifecycle: {
    mounted() {
      this.mountCount += 1;
    },
    afterCommit(params) {
      console.log('afterCommit', params);
    },
    beforeCommit(params) {
      console.log('beforeCommit');
      params.draft.time = Date.now();
      console.log(params);
    },
  },
});

function Shop() {
  const store = storeCtx.useStore();
  const ld = storeCtx.useLoading();
  // fetchList 的运行状态，如关系其他函数运行状态，可从 ld 继续解构获取到
  const { loading, err, ok } = ld.fetchList;

  return (
    <div>
      {loading && <h1>fetching books</h1>}
      {err && <h1>{err.message}</h1>}
      {ok && store.list.map((v) => <div key={v.id}>name:{v.name} price:{v.price}</div>)}
      <h3>total {store.total}</h3>
      <h3>totalPlus {store.totalPlus}</h3>
      <button onClick={() => store.fetchList({ page: 1, size: 10 }, 222)}>more</button>
      <button onClick={() => store.changeTotal(Date.now())}>change total</button>
      <button onClick={() => store.total++}>change total at comp</button>
      <button onClick={() => storeCtx.reset()}>reset</button>
    </div>
  );
}

// 细粒度绑定
function Other() {
  return <div>
    total: {$(storeCtx.state.totalPlus)}
    <br />
    totalPlus2: {$(storeCtx.state.totalPlus2)}
    <br />
    mountCount: {$(storeCtx.state.mountCount)}
  </div>
}

function Snap() {
  storeCtx.useStore();
  return <div style={{ border: '3px solid red', padding: '10px', margin: '12px' }}>
    Snap: {JSON.stringify(storeCtx.getSnap())}
    <br />
    GettersSnap: {JSON.stringify(storeCtx.getGettersSnap())}
    <button onClick={() => { console.log(storeCtx) }}>see store context</button>
  </div>
}

function Index() {
  return (
    <div>
      <Other />
      <Shop />
      <Snap />
    </div>
  );
}

export const BestParctice2 = React.memo(Index);
