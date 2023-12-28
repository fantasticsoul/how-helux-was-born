import React from 'react';
import { atom, $ } from 'helux';
import { Entry } from '../../comps';
import { createDcDemo } from '../util';

// copy code to cb body
const Demo = createDcDemo(() => {
  const [data, setState, ctx1] = atom({ a: 1, b: 100, ccc: 1000, d: { d1: { d2: 1 } } }, {
    moduleName: 'AtomMutateTask_draft',
    alertDeadCycleErr: false,
  });

  ctx1.mutate({
    deps: () => [data.val.a],
    async task({ draft }) {
      console.log('trigger task');
      draft.a += 1;
    },
    desc: 'ctx1.mutate',
  });

  function changeA() {
    ctx1.reactive.a += 5;
  }

  return () => (
    <Entry fns={[changeA]}>
      {$(data.val.a)}
    </Entry>
  );
});

export default Demo;
