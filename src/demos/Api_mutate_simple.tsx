import React from 'react';
import { mutate, atom, share, useAtom, reactiveDesc, flush, $ } from 'helux';
import { MarkUpdate, Entry } from './comps';

const [priceState, setPrice, ctx1] = share({ a: 1, b: 100, ccc: 1000, d: { d1: { d2: 1 } } }, {
  moduleName: 'Api_mutate_simple',
  mutateList: [],
});
console.log('before mutate');
const witness = mutate(priceState)((draft) => {
  console.log('executing mutate');
  draft.a = draft.b + 1;
});
console.log('after mutate');

function changeB() {
  setPrice(draft => void (draft.b += 1));
}

setTimeout(() => {
  console.log('witness.cancel');
  witness.cancel();
}, 3000)

const Demo = () => (
  <Entry fns={[changeB]}>
    <h3>ctxp.reactive.a: {$(ctx1.reactive.a)}</h3>
    <h3>ctxp.reactive.b: {$(ctx1.reactive.b)}</h3>
  </Entry>
);

export default Demo;
