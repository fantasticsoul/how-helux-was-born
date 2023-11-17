import { $, share, mutateDict, runMutate } from 'helux';
import React from 'react';
import { MarkUpdate, Entry } from '../comps';
import { random, delay } from "../logic/util";

const [sharedState, setState, ctx] = share({ a: 1, b: { b1: { b2: 200 } }, c: 2, d: 10, e: 1 }, { moduleName: 'ForCopy' });

// const witness1 = ctx.mutate({
//   deps: (state) => [state.a],
//   fn: (draft) => { draft.c = draft.a + 1 + random() },
// });
// const witness2 = ctx.mutate({
//   deps: (state) => [state.c],
//   fn: (draft) => { draft.a = draft.c + 1 + random() },
// });

const witnessDict = mutateDict(sharedState)({
  // key1: {
  //   deps: (state) => [state.a],
  //   fn: (draft) => { draft.c = draft.a + 1 + random() },
  // },
  key1: {
    deps: (state) => [state.a],
    fn: (draft, [a]) => { draft.b = a + 1 + random() },
  },
  key2: {
    deps: (state) => [state.b],
    fn: (draft, [b]) => { draft.c = b + 1 + random() },
  },
  key3: {
    deps: (state) => [state.c],
    fn: (draft, [c]) => { draft.d = c + 1 + random() },
  },
  key4: {
    deps: (state) => [state.d],
    fn: (draft, [d]) => { draft.a = d + 1 + random() },
  },


  // depA: {
  //   deps: (state) => [state.a],
  //   fn: (draft, [a]) => { draft.b = a + 1 + random() },
  // },
  // depB: {
  //   deps: (state) => [state.b],
  //   fn: (draft, [b]) => { draft.a = b + 1 + random() },
  // },
});
// witnessDict.key1.call();

// const witnessDict2 = mutateDict(sharedState)({
//   test: {
//     deps: () => [],
//     fn: (draft) => draft.a  = 1,
//   }
// });

function changeA() {
  setState((draft) => {
    draft.a += 1;
  });
}

function changeC() {
  ctx.runMutate('key3');
  // setState((draft) => {
  //   draft.c += 1;
  // });
}

function Comp() {
  return (
    <MarkUpdate>
      shared.a:  {$(sharedState.a)}
    </MarkUpdate>
  );
}

function Comp2() {
  return (
    <MarkUpdate>
      shared.c {$(sharedState.c)}
    </MarkUpdate>
  );
}

const Demo = () => (
  <Entry fns={[changeA, changeC]}>
    <Comp />
    <Comp2 />
  </Entry>
);

export default Demo;
