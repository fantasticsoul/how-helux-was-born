import { $, share, mutateDict } from 'helux';
import React from 'react';
import { MarkUpdate, Entry } from '../comps';
import { random, delay } from "../logic/util";

const [sharedState, setState, ctx] = share({ a: 1, b: { b1: { b2: 200 } }, c: 2 }, { moduleName: 'ForCopy' });

// const witness1 = ctx.mutate({
//   deps: (state) => [state.a],
//   fn: (draft) => { draft.c = draft.a + 1 + random() },
// });
// const witness2 = ctx.mutate({
//   deps: (state) => [state.c],
//   fn: (draft) => { draft.a = draft.c + 1 + random() },
// });
// console.log();

const witnessDict = mutateDict(sharedState)({
  key1: {
    deps: (state) => [state.a],
    fn: (draft) => { draft.c = draft.a + 1 + random() },
  },
  key2: {
    deps: (state) => [state.c],
    fn: (draft) => { draft.a = draft.c + 1 + random() },
  }
});
// witnessDict.key1.call();

function changeA() {
  setState((draft) => {
    draft.a += 1;
  });
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
const witnessDict2 = mutateDict(sharedState)({
  test: {
    deps: () => [],
    fn: (draft) => draft.a  = 1,
  }
});

const Demo = () => (
  <Entry fns={[changeA]}>
    {/* <Comp />
    <Comp2 /> */}
  </Entry>
);

export default Demo;
