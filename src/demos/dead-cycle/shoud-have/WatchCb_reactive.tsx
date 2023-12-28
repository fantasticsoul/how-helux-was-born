import React from 'react';
import { share, $, watch } from 'helux';
import { MarkUpdate, Entry } from '../../comps';
import { createDcDemo } from '../util';

// copy code to cb body
const Demo = createDcDemo(() => {
  const [data, setState, ctx1] = share({ a: 1, b: 100, ccc: 1000, d: { d1: { d2: 1 } } }, {
    moduleName: 'WatchCb_reactive',
    alertDeadCycleErr: false,
  });

  // 以下示例只执行一次代表死循环拦截拦截正常
  watch(() => {
    ctx1.reactive.a += 5;
  }, { immediate: true });

  function changeA() {
    ctx1.reactive.a += 5;
  }

  return () => (
    <Entry fns={[changeA]}>
      {$(data.a)}
    </Entry>
  );
});

export default Demo;
