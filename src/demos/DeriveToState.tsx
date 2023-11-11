import React from 'react';
import {
  useShared, share, watch, useForceUpdate, derive, useDerived, useDerivedAsync,
  deriveAsync, runDerive, createShared,
} from 'helux';
import * as util from './logic/util';
import { MarkUpdate, Entry } from './comps';


const ori = { a: 50, doubleA: 0, b: 2, c: { c1: 100, c2: 1000 }, list: [{ name: 'one', age: 1 }] };
const [ret, setState, call] = share(ori, { moduleName: 'd2s' });

watch(() => {
  const { a } = ret;
  setState(draft => { draft.doubleA = a * 2 });
}, () => [ret.a]);

const coolWrap = derive(() => {
  const { doubleA } = ret;
  return { cool: doubleA + 19 }
});

const outRet = deriveAsync({
  deps: () => [ret.doubleA] as const,
  fn: () => ({ val: 0 }),
  task: async ({ input: [doubleA] }) => {
    await util.delay();
    return { val: doubleA + 100 + util.random() };
  },
});

// @ts-ignore
const rerun = () => runDerive(outRet);

function change_a() {
  setState(draft => {
    draft.a = util.random();
  });
  console.log('ret.a', ret.a);
  console.log('ret.doubleA', ret.doubleA);
}

function A() {
  console.log('Render A', ret);
  const [state] = useShared(ret);
  return (
    <div>
      {state.a}
    </div>
  );
}

function DoubleA() {
  console.log('Render DoubleA');
  const [state] = useShared(ret);
  return (
    <div>
      state.doubleA：{state.doubleA}
    </div>
  );
}

function ReadCool() {
  console.log('Render ReadCool');
  const [coolCu] = useDerived(coolWrap);
  return (
    <div>
      read derived val 22: {coolCu.cool}
    </div>
  );
}

function DeriveInComp() {
  console.log('Render DeriveInComp');
  const [coolCu] = useDerived(() => {
    const { doubleA } = ret;
    return { val: doubleA + 50 };
  });
  return (
    <div>
      read derived val in comp ffff: {coolCu.val}
    </div>
  );
}

function DeriveAsyncInComp() {
  console.log('Render DeriveAsyncInComp');

  // TODO CHECK
  const [innerResult] = useDerivedAsync({
    deps: () => [outRet.val] as const,
    fn: () => ({ val: 0 }),
    task: async ({ input: [val] }) => {
      await util.delay();
      return { val: val + 100 + util.random() };
    },
  });

  const [outData] = useDerived(outRet);
  return (
    <div>
      inner async derived: {innerResult.val}
      <br />
      out async derived: {outData.val}
    </div>
  );
}

function Demo(props: any) {
  return <Entry fns={[change_a, rerun]}>
    <A />
    <DoubleA />
    <ReadCool />
    <DeriveInComp />
    <DeriveAsyncInComp />
  </Entry>
}

export default Demo;
