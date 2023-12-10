import React from 'react';
import { mutate, share, useAtom, reactiveDesc, flush } from 'helux';
import { MarkUpdate, Entry } from './comps';
import { random, delay } from './logic/util';

const [priceState, setPrice, ctxp] = share({ a: 1, b: 100, ccc: 1000 }, { moduleName: 'Api_mutate' });
const [finalPriceState, , ctx] = share({ retA: 0, time: 0 }, { moduleName: 'Api_mutate_finalPriceState' });

// 约束各个函数入参类型
type Payloads = {
  changeA: [number, number];
  foo: boolean | undefined;
};

const { actions, useLoading } = ctxp.defineActions<Payloads>()({
  changeA({ draftRoot, payload }) {
    draftRoot.a = 200;
  },
  async foo({ draftRoot, payload }) {
    await delay(3000);
    draftRoot.ccc += 1000;
  },
});

const s = actions.changeA([1, 2]);
console.log('111 is ', s);
console.log('foo is ', actions.foo(true));
setTimeout(() => {
  // const s = actions.changeA(1, 2);
  console.log('222 s is ', s);
}, 3000);


// 外部定义 mutate 函数
const witness = mutate(finalPriceState)({
  fn: (draft) => draft.retA += 100, // 初始值函数，只会执行一次
  deps: () => [priceState.a] as const,
  task: async ({ input: [a], setState, draftRoot }) => {
    reactiveDesc(draftRoot, 'change1');
    draftRoot.retA += a;
    await delay(1000);
    reactiveDesc(draftRoot, 'change2');
    draftRoot.retA += a;
    await delay(1000);
    reactiveDesc(draftRoot, 'change-->3');
    draftRoot.retA += a;
    await delay(1000);
    ctx.reactiveDesc('change-->4');
    draftRoot.retA += a;
    await delay(1000);
    ctx.reactiveDesc('change-->5');
    draftRoot.retA += a;
    await delay(1000);

    draftRoot.retA += a;
    flush(draftRoot, 'flush1'); // 主动提交变更
    draftRoot.retA += a;
    flush(draftRoot, 'flush2');
    draftRoot.retA += a;
    flush(draftRoot, 'flush3');

    console.error('after ----------------------------------------------------------------');
    draftRoot.retA += a;
    setState(draft => { draft.retA += a });
  },
  immediate: true, // 控制 task 立即执行
});

// 外部定义 mutate 函数
// const witness2 = mutate(finalPriceState)({ fn: (draft) => draft.retA += 100, desc: 'gogo' });

// setInterval(() => {
//   witness2.call();
// }, 2000);

function changePrice() {
  setPrice(draft => { draft.a = random() });
}

function changePrev() {
  setPrice(draft => {
    const { a } = draft;
    draft.a = a;
  });
}

function forceRunMutate() {
  witness.call();
};
function forceRunMutateTask() {
  witness.callTask();
};

function Price() {
  const [price, , info] = useAtom(priceState);
  const [ld] = useLoading();

  return <MarkUpdate name="Price" info={info}>
    {price.a}
    <h3>{ld.foo.loading ? 'foo is running' : 'foo is done'}</h3>
  </MarkUpdate>;
}

function FinalPrice() {
  const [finalPrice, , info] = useAtom(finalPriceState);
  const [loading] = ctx.useMutateLoading();
  const status = loading[witness.desc];

  return <MarkUpdate name="FinalPrice" info={info}>
    {status.loading && 'loading'}
    {status.err && status.err.message}
    {status.ok && <>finalPrice.retA: {finalPrice.retA}</>}
  </MarkUpdate>;
}

const Demo = () => (
  <Entry fns={[forceRunMutate, forceRunMutateTask, changePrev, changePrice, actions.foo]}>
    <Price />
    <Price />
    <FinalPrice />
    <FinalPrice />
  </Entry>
);

export default Demo;
