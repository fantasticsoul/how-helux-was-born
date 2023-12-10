import { $, share, atom, currentDraftRoot, useAtom, sync } from 'helux';
import React from 'react';
import { MarkUpdate, Entry } from './comps';
import { dictFactory } from "./logic/util";

const [shared] = share(dictFactory);

const [objAtom, setAtom, ctx] = atom({ a: 1, b: { b1: { b2: '200' } } }, {
  moduleName: 'DeriveTask',
  rules: [
    {
      when: () => [],
      // when: state => state.val.a
      globalIds: [],
    }
  ],
  before(params) {
    console.log('test before', params);
  },
});
const [numAtom, setNum, numCtx] = atom(1);

function changeA() {
  setAtom((draft) => {
    draft.a += 1;
  });
}

function SharedAtom() {
  const [stateDict] = useAtom(shared);
  const [state] = ctx.useState();
  const [num] = numCtx.useState();
  return (
    <MarkUpdate>
      primitive syncer <input value={num} onChange={numCtx.syncer} />
      <br />
      ( currentDraftRoot ) primitive sync <input value={num} onChange={numCtx.sync(to => to, () => currentDraftRoot(numAtom).val = 222)} />
      <br />
      ( setAtomVal ) primitive sync <input value={num} onChange={numCtx.sync(to => to, () => numCtx.setAtomVal(333))} />
      <br />
      primitive sync <input value={num} onChange={numCtx.sync(to => to, (a, draft) => Date.now())} />
      <hr />
      syncer<input value={state.a} onChange={(e: any) => ctx.setState(draft => { draft.a = e.target.value })} />
      <br />
      syncer no {'{}'}<input value={state.a} onChange={(e: any) => ctx.setState(draft => draft.a = e.target.value)} />
      <br />
      syncer.a<input value={state.a} onChange={ctx.syncer.a} />
      <br />
      stateDict.a.b.c <input value={stateDict.a.b.c} onChange={sync(stateDict)(to => to.a.b.c)} />
      <br />

      syncer.b<input value={state.b.b1.b2} onChange={ctx.sync(to => to.b.b1.b2)} />
      <br />
      sync<input value={state.a} onChange={ctx.sync(to => to.a, (a, draft) => draft.a = Date.now())} />
      <br />
      sync multi path<input style={{ width: '300px' }} value={state.b.b1.b2} onChange={ctx.sync(to => to.b.b1.b2)} />
      <br />
      sync multi path by path arr<input style={{ width: '300px' }} value={state.b.b1.b2} onChange={ctx.sync(['b', 'b1', 'b2'])} />
      {/* <br />
      sync multi path with before<input style={{ width: '300px' }} value={state.b.b1.b2} onChange={ctx.sync(to => to.b.b1.b2, (b, draft) => draft.b.b1.b2 = `${b}_${Date.now()}`)} /> */}
      <br />
      <hr />
      {/* ( wrong binding ) syncer.b<input value={state.b.b1.b2} onChange={ctx.syncer.b} /> */}
    </MarkUpdate>
  );
}

const Demo = () => (
  <Entry fns={[changeA]}>
    <SharedAtom />
  </Entry>
);

export default Demo;
