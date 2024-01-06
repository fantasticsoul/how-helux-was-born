import React from "react";
import {
  atom,
  watch,
  useAtom,
} from "helux";
import { MarkUpdate, Entry } from './comps';
import { random } from './logic/util';

const [numAtom, setAtom, ctx] = atom(1, { moduleName: 'Atom' });

function changeNumOutOfComp() {
  setAtom(numAtom.val + 1);
}

watch((params) => {
  const { val } = numAtom;
  console.log("val changed -->", val);
}, { immediate: true });


function NumAtom() {
  const [num, setNum, info] = useAtom(numAtom, { collectType: 'first' });
  const changeNum = () => setNum(num + 1);
  const changeNumByDraft = () => setNum((val) => (val + 2));

  return (
    <MarkUpdate info={info}>
      <pre>num: {num}</pre>
      <button onClick={changeNum}>changeNum</button>
      <button onClick={changeNumByDraft}>changeNumByDraft</button>
    </MarkUpdate>
  );
}


function Demo(props: any) {
  return (
    <Entry fns={[changeNumOutOfComp]}>
      <NumAtom />
    </Entry>
  );
}

export default Demo;

