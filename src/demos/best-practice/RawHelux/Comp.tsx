/**
 * https://codesandbox.io/p/sandbox/helux-best-practice-9qds9x?file=%2Fsrc%2FLikePinia.tsx
 */
import React from 'react';
import { $ } from 'helux';
import { store } from './store';

function Shop() {
  const [state] = store.useReactive();

  return (
    <div>
      <h3>total {state.total}</h3>
      <h3>totalPlus {state.totalPlus}</h3>
      <h3>totalPlus2 {state.totalPlus2}</h3>
      <button onClick={() => store.actions.changeTotal()}>change total !!!</button>
    </div>
  );
}

// 细粒度绑定
function Other() {
  return <div>
    singal area
    <br />
    total: {$(store.state.total)}
    <br />
    totalPlus: {$(store.state.totalPlus)}
    <br />
    totalPlus2: {$(store.state.totalPlus2)}
  </div>
}

function Index() {
  return (
    <div>
      <Shop />
      <Other />
    </div>
  );
}

export const RawHelux = React.memo(Index);
