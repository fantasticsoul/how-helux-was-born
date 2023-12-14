import React from 'react';
import { atom, sharex, useAtom, atomx, $ } from 'helux';
import { MarkUpdate, Entry } from './comps';
import { log, delay } from './logic/util';

const [baseAtom, setAtom] = atom(3000, { moduleName: 'baseAtom' });

const [doubleAtom] = atom(2, {
  moduleName: 'doubleAtom',
  mutate: [
    // {
    //   // TODO 加入死循环示例
    //   fn: () => baseAtom.val * 2,
    //   desc: 'atom_m',
    // },
    {
      // TODO 加入死循环示例
      fn: (draft: any) => draft * 2,
      desc: 'atom_xxx',
    },
  ],
});
const [minus10Atom] = atom(0, {
  mutate: () => doubleAtom.val - 10,
});
atom(0)[2].mutate(() => doubleAtom.val - 10);

const x = atomx({ a: 1, b: 2 }, { moduleName: 'yy' });

// x.mutate(() => ({ a: 3, b: 4 }));
x.mutate({
  // TODO  死循环示例
  fn: (draft, { draftRoot }) => {
    // draftRoot.val = { a: 3, b: 4 }; // dc
    // return { a: 3, b: 4 };
    console.error('trigger fn');
    // draft.a = draft.b + 8;
    draft.a = draftRoot.val.b + 8;
    console.log('a is', draft.a);
  },
  desc: 'xx',
});

const x2 = sharex({ a: 1, b: 2 }, { moduleName: 'yy2' });

console.log(x.state.val.a);
x.reactive.b = 100;
x.flush();
console.log(x.state.val.a);

x.reactive.b = 103;
x.flush();
console.log(x.state.val.a);
console.log(x.state.val.b);

x.reactive.b = 108;
x.flush();
console.log(x.state.val.a);
console.log(x.state.val.b);

function Price() {
  const [base, , info] = useAtom(baseAtom);
  return <MarkUpdate name="Price" info={info}>{base}</MarkUpdate>;
}

function IdealPrice() {
  const [double, , info] = useAtom(doubleAtom);
  return <MarkUpdate name="Price" info={info}>{double}</MarkUpdate>;
}

function FinalPrice() {
  const [minus10, , info] = useAtom(minus10Atom);
  return <MarkUpdate name="Price" info={info}>{minus10}</MarkUpdate>;
}

function changeBase() {
  setAtom(baseAtom.val + 100);
}

function changeB1() {
  x.setState(draft => { draft.b = 100 });
}

function changeB2() {
  x.reactive.b = 200;
}

function changeB3() {
  x.reactiveRoot.val.b = 300;
}

function Demo(props: any) {
  const fns = [changeBase, changeB1, changeB2, changeB3];
  // const fns:any[] = [];
  return <Entry fns={fns}>
    <Price />
    <IdealPrice />
    <IdealPrice />
    <FinalPrice />
    <FinalPrice />
    {$(x.reactive.a)}
  </Entry>
}


export default Demo;
