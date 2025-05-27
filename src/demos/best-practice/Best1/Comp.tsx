/**
 * https://codesandbox.io/p/sandbox/helux-best-practice-9qds9x?file=%2Fsrc%2FLikePinia.tsx
 */
import React from 'react';
import { $ } from 'helux';
import { storeCtx } from './store';


function Shop() {
  console.log(' >> Render Shop');
  const store = storeCtx.useStore();
  const ld = storeCtx.useLoading();
  // fetchList 的运行状态，如关系其他函数运行状态，可从 ld 继续解构获取到
  const { loading, err, ok } = ld.fetchList;
  const changeLocal = () => {
    store.a += 1000;
    storeCtx.reactiveDesc('changeLocal');
  };

  return (
    <div>
      {loading && <h1>fetching books</h1>}
      {err && <h1>{err.message}</h1>}
      {ok && store.list.map((v) => <div key={v.id}>name:{v.name} price:{v.price}</div>)}

      <h3>total {store.total}</h3>
      <h3>totalPlus {store.totalPlus}</h3>

      <button onClick={() => store.fetchList({ page: 1, size: 10 }, 222)}>more</button>
      <button onClick={() => store.changeTotal(Date.now())}>change total</button>
      <button onClick={() => store.total = 1000}>change total at comp!</button>
      <button onClick={() => storeCtx.reset()}>reset</button>
      <button onClick={() => store.testCatch()}>testCatch</button>
      <button onClick={changeLocal}>changeLocal</button>
    </div>
  );
}

// 细粒度绑定
function Other() {
  return <div>
    total: {$(storeCtx.state.total)}
    <br />
    totalPlus: {$(storeCtx.state.totalPlus)}
    <br />
    mountCount: {$(storeCtx.state.mountCount)}
    <br />
    a: {$(storeCtx.state.a)}
    <br />
    b: {$(storeCtx.state.b)}
    <br />
    c: {$(storeCtx.state.c)}
  </div>
}

function Snap() {
  console.log(' >> Render Snap');
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

export const DefineStoreDemo = React.memo(Index);
