import { $, share, action, actionAsync, mutate } from 'helux';
import React from 'react';
import { MarkUpdate, Entry } from '../comps';
import { random, delay } from "../logic/util";

const [sharedState, setState, ctx] = share({ a: 1, b: { b1: { b2: 200 } } }, { moduleName: 'ActionLoading' });

const myAction = action(sharedState)(({ draft }) => {
  draft.a += 100;
}, 'action')

const myAsyncAction = actionAsync(sharedState)(async ({ setState }) => {
  await delay(2000);
  setState(draft => { draft.a += 100 });
}, 'myAsyncAction')

function Comp() {
  const [loading] = ctx.useActionLoading();
  console.log(loading['myAsyncAction']);

  return (
    <MarkUpdate>
      <h1>{loading['myAsyncAction'].loading && 'loading...'}</h1>
      shared.xxx {$(sharedState.a)}
    </MarkUpdate>
  );
}

const Demo = () => (
  <Entry fns={[myAction, myAsyncAction]}>
    <Comp />
  </Entry>
);

export default Demo;
