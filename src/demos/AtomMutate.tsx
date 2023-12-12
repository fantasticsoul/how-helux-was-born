import React from 'react';
import { atom, share, useAtom, useForceUpdate } from 'helux';
import { MarkUpdate, Entry } from './comps';
import { log, delay } from './logic/util';

const [baseAtom, setAtom] = atom(3000, { moduleName: 'baseAtom' });
const [doubleAtom] = atom(0, {
  mutate: () => baseAtom.val * 2,
});
const [minus10Atom] = atom(0, {
  mutate: () => doubleAtom.val - 10,
});

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

function Demo(props: any) {
  return <Entry fns={[changeBase]}>
    <Price />
    <IdealPrice />
    <IdealPrice />
    <FinalPrice />
    <FinalPrice />
  </Entry>
}


export default Demo;
