import React from 'react';
import { $ } from 'helux';
import { defineLayeredStore } from '@helux/store-pinia';

interface IBook {
  id: string;
  name: string;
  price: number;
}

const delay = (ms = 1000) => new Promise(r => setTimeout(r, ms));

const storeCtx = defineLayeredStore('Book', {
  state: () => ({ list: [] as IBook[], page: 1, size: 10, total: 6, mountCount: 0 }),
  getters: {
    totalPlus() {
      return this.state.total + 1;
    },
    totalPlus2() {
      return this.totalPlus + 100;
    },
  },
  actions: {
    async changeTotalProxy() {
      this.changeTotal(1000);
      await delay();
      this.changeTotal(88);
    },
    changeTotal(payload: number) {
      this.state.total = payload;
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
      this.state.list = list;
      this.state.total = total;
    },
  },
  lifecycle: {
    mounted() {
      this.state.mountCount += 1;
    },
  },
});

function Shop() {
  const [state, actions] = storeCtx.useState();
  const getters = storeCtx.useGetters();
  const ld = storeCtx.useLoading();
  // fetchList 的运行状态，如关系其他函数运行状态，可从 ld 继续解构获取到
  const { loading, err, ok } = ld.fetchList;

  return (
    <div>
      <h4>component Shop</h4>
      {loading && <h1>fetching books</h1>}
      {err && <h1>{err.message}</h1>}
      {ok && state.list.map((v) => <div key={v.id}>name:{v.name} price:{v.price}</div>)}
      <h3>total {state.total}</h3>
      <h3>totalPlus {getters.totalPlus}</h3>
      <button onClick={() => actions.fetchList({ page: 1, size: 10 }, 222)}>more</button>
      <button onClick={() => actions.changeTotal(Date.now())}>change total</button>
      <button onClick={() => actions.changeTotalProxy()}>change total proxy</button>
      <button onClick={() => storeCtx.reset()}>reset</button>
    </div>
  );
}

// 细粒度绑定.
function Other() {
  return <div>
    <h4>component Other...</h4>
    total: {$(storeCtx.getters.totalPlus)}
    <br />
    totalPlus2: {$(storeCtx.getters.totalPlus2)}
    <br />
    mountCount: {$(storeCtx.state.mountCount)}
  </div>
}

function Snap() {
  storeCtx.useState();
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

export const BestParcticeLayered = React.memo(Index);
