import React from 'react';
import { share, atom, watch, useAtomDerived, useShared, useAtom, useForceUpdate, deriveAtom, useGlobalId } from 'helux';
import * as util from './logic/util';
import { MarkUpdate, Entry } from './comps';

const keySym = Symbol('keySym');
const keyNum = 2;

const [sharedState, setState] = share({ a: { a1: 1 }, b: { b1: 1 } });

const [numAtom, setAtom] = atom(1, {
  moduleName: 'GlobalId',
  rules: [
    { when: (state) => state.val, globalIds: ['JustUpdateMe', keySym, keyNum] }
  ]
});

function changeA() {
  setState(draft => { draft.a.a1 += 1 }, { globalIds: ['test'] })
}

const numPlusAtom = deriveAtom(() => {
  return numAtom.val + 100;
});

watch((params) => {
  const { val } = numAtom;
  console.log('val changed -->', val);
});

function NumAtom() {
  const [num, setNum, info] = useAtom(numAtom);
  const changeNum = () => setNum(num + 1);
  const changeNumByDraft = () => setNum(d => d.val += 2);

  return (
    <MarkUpdate info={info}>
      <pre>num: {num}</pre>
      <button onClick={changeNum}>changeNum</button>
      <button onClick={changeNumByDraft}>changeNumByDraft</button>
    </MarkUpdate>
  );
}

function NumPlusAtom() {
  const [num, , info] = useAtomDerived(numPlusAtom);

  return (
    <MarkUpdate info={info}>
      <pre>num plus: {num}</pre>
    </MarkUpdate>
  );
}


function NumPlusAtom2(props: any) {
  const forceUpdate = useForceUpdate();
  const [state, , info] = useShared(sharedState);

  return (
    <MarkUpdate info={info} name="useAtomDerived with globalId">
      <pre onClick={forceUpdate}>{state.b.b1}</pre>
    </MarkUpdate>
  );
}


function UpdateForStrId() {
  const info = useGlobalId(keySym);

  return (
    <MarkUpdate info={info}>
      <h3>rerender because of globaId</h3>
      <pre>update at: {Date.now()}</pre>
    </MarkUpdate>
  );
}

function UpdateForSymbolId() {
  const info = useGlobalId(keyNum);

  return (
    <MarkUpdate info={info}>
      <h3>rerender because of globaId</h3>
      <pre>update at: {Date.now()}</pre>
    </MarkUpdate>
  );
}

function UpdateForNumId() {
  const info = useGlobalId('JustUpdateMe');

  return (
    <MarkUpdate info={info}>
      <h3>rerender because of globaId</h3>
      <pre>update at: {Date.now()}</pre>
    </MarkUpdate>
  );
}

function addNumByDraft() {
  setAtom(draft => draft.val += 1);
}

function addNum() {
  setAtom(numAtom.val + 1);
}

const Demo = () => (
  <Entry fns={[addNumByDraft, addNum, changeA]}>
    <NumPlusAtom2 />
    <NumAtom />
    <NumAtom />
    <NumPlusAtom />
    <NumPlusAtom />
    <UpdateForStrId />
    <UpdateForStrId />
    <UpdateForSymbolId />
    <UpdateForSymbolId />
    <UpdateForNumId />
    <UpdateForNumId />
  </Entry >
);



export default Demo;
