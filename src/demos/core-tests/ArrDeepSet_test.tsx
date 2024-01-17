import { $, sharex, watchEffect, derive } from "helux";
import React from "react";

const delay = (ms = 1000) => new Promise((r) => setTimeout(r, ms));

const { state, defineActions, defineFullDerive } = sharex({
  list: {
    target: [
      {
        key: {
          list: [
            {
              visible: true
            },
            {
              visible: true
            }
          ]
        }
      }
    ]
  }
});

const { actions } = defineActions()({
  changeVisible({ draft }) {
    const ret = !draft.list.target[0].key.list[0].visible;
    console.log('ret ', ret);
    draft.list.target[0].key.list[0].visible = ret;
  }
});

const { result, helper } = defineFullDerive()({
  test({ state }) {
    const { list } = state;
    console.log('list changed', list);
    return Date.now();
  }
})


watchEffect(()=>{
  const { list } = state;
  console.log('list changed', list);
})

watchEffect(()=>{
  const { list } = state;
  console.log('list.target[0].key', list.target[0].key);
})

derive(()=>{
  const { list } = state;
  console.log('derive list.target[0].key', list.target[0].key);
  return 2;
});

derive(()=>{
  const { list } = state;
  console.log('derive list.target[0].key.list[0].visible', list.target[0].key.list[0].visible );
  return 2;
});

derive(()=>{
  const { list } = state;
  console.log('derive list.target[0].key.list[1].visible', list.target[0].key.list[1].visible );
  return 3;
});

function Demo() {
  const test = helper.test.useDerived();
  return <h1>{test}</h1>
}

export default function Test() {
  return (
    <div className="App" onClick={actions.changeVisible}>
      <Demo />
    </div>
  );
}
