import { $, atom, share } from 'helux';
import React from 'react';
import { MarkUpdate, Entry } from '../comps';

const [shared, setState] = share({ number: 1 })

const [listAtom, setAtom] = atom([{ a: 1, b: { name: 2 } }, { a: 2, b: { name: 4 } }]);
function changeItem() {
  const prevItem0 = listAtom.val[0];
  const prevItem1 = listAtom.val[1];
  setAtom(draft => { draft[0].b.name = Date.now() });
  const currItem0 = listAtom.val[0];
  const currItem1 = listAtom.val[1];
  console.log('prevItem0===currItem0 ', prevItem0 === currItem0);
  console.log('prevItem1===currItem1 ', prevItem1 === currItem1);
}

function Comp() {
  return (
    <MarkUpdate>
      listAtom.d {$(listAtom.val[0].b.name)}
    </MarkUpdate>
  );
}

const Demo = () => (
  <Entry fns={[changeItem]}>
    <Comp />
    <Comp />
  </Entry>
);

export default Demo;
