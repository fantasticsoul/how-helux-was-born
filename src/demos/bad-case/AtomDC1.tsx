import React from 'react';
import { mutate, share, useAtom, atom, flush, $ } from 'helux';
import { MarkUpdate, Entry } from '../comps';
import { random, delay, noop, dictFactory } from '../logic/util';

const [priceState, setPrice, ctx1] = share({ a: 1, b: 100, ccc: 1000, d: { d1: { d2: 1 } } }, {
  moduleName: 'Api_mutate',
  enableDraftDep: true,
  recordLoading: 'no',
});
const [finalPriceState, setP2, ctx2] = share({ retA: 0, retB: 0, time: 0, time2: 0, f: { f1: 1 } }, {
  moduleName: 'Api_mutate_finalPriceState',
  enableDraftDep: true,
  recordLoading: 'no',
});

// 约束各个函数入参类型
type Payloads = {
  changeA: [number, number];
  foo: boolean | undefined;
};

const { actions, useLoading } = ctx1.defineActions<Payloads>()({
  changeA({ draftRoot, payload }) {
    draftRoot.a = 200;
  },
  async foo({ draftRoot, payload }) {
    await delay(3000);
    draftRoot.ccc += 1000;
  },
});

// const s = actions.changeA([1, 2]);
// console.log('111 is ', s);
// console.log('foo is ', actions.foo(true));
// setTimeout(() => {
//   // const s = actions.changeA(1, 2);
//   console.log('222 s is ', s);
// }, 3000);


// const witness2 = mutate(finalPriceState)({
//   fn: (draft) => draft.time = draft.time2 + 1,
// });

// const witness3 = mutate(finalPriceState)({
//   fn: (draft) => draft.time2 = draft.time + 1,
// });

// 外部定义 mutate 函数
const witness = mutate(finalPriceState)({
  // 初始值函数，只会执行一次
  fn: (draft) => {
    draft.retA = 3000;
    draft.time += 1;
    draft.retA += 100; // 触发死循环
    // setP2(draft => { draft.retA += 100 });
  },
  deps: () => [priceState.a, finalPriceState.retA, finalPriceState.retB] as const,
  task: async ({ input: [a], setState, draft }) => {
    console.error('trigger task');
    // reactiveDesc(draft, 'change1');
    const result = draft.retA + a
    // console.error('trigger task draft.retA += a', result);
    // ctx1.reactive.ccc += 1000;
    // console.log('ctxp.reactive.ccc ', ctx1.reactive.ccc);

    // const d1 = ctx1.reactive.d.d1;
    noop(ctx2.reactive.f.f1);
    // d1.d2 = 3000;
    noop(ctx2.reactive.f.f1);
    noop(draft.f.f1);

    // ctxp.reactive.a += 1;
    // ctxp.reactive.a += 1;
    // ctxp.reactive.a += 100;
    // console.log('after ctxp.reactive.a', ctxp.reactive.a);
    // await delay(1000);
    // reactiveDesc(draft, 'change2');
    // draft.retA += a;
    // await delay(1000);
    // reactiveDesc(draft, 'change-->3');
    // draft.retA += a;
    // await delay(1000);
    // ctx.reactiveDesc('change-->4');
    // draft.retA += a;
    // await delay(1000);
    // ctx.reactiveDesc('change-->5');
    // draft.retA += a;
    // await delay(1000);

    // draft.retA += a;
    // flush(draft, 'flush1'); // 主动提交变更
    // draft.retA += a;
    // flush(draft, 'flush2');
    // draft.retA += a;
    // flush(draft, 'flush3');

    draft.retA += a;
    setState(draft => { draft.retB += a });
    console.error('after ----------------------------------------------------------------');
  },
  desc: 'dangerousMutate',
  immediate: true, // 控制 task 立即执行
});

// 外部定义 mutate 函数
// const witness2 = mutate(finalPriceState)({ fn: (draft) => draft.retA += 100, desc: 'gogo' });

// setInterval(() => {
//   witness2.call();
// }, 2000);

function changePriceA() {
  setPrice(draft => { draft.a = random() });
  // ctxp.reactive.a = random();
}

function changeRetA() {
  setP2(draft => { draft.retA += 1 });
}

function changePrev() {
  setPrice(draft => {
    const { a } = draft;
    draft.a = a;
  });
}

function seeCCC() {
  console.log(ctx1.reactive.ccc);
}

function forceRunMutate() {
  witness.run();
};
function forceRunMutateTask() {
  witness.runTask();
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
  const [loading] = ctx2.useMutateLoading();
  const status = loading[witness.desc];

  return <MarkUpdate name="FinalPrice" info={info}>
    {status.loading && 'loading'}
    {status.err && status.err.message}
    {status.ok && <>finalPrice.retA: {finalPrice.retA}</>}
  </MarkUpdate>;
}

function CCC() {
  const [r, , info] = ctx1.useReactive();
  const [loading] = ctx2.useMutateLoading();
  return <MarkUpdate name="FinalPrice" info={info}>
    {r.ccc}
  </MarkUpdate>;
}

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

// TODO FIXME 这里为 1 触发死循环误判（ 和 Api_mutate 文件冲突 ）
const [numAtom, setNum, numCtx] = atom(1);
// const [numAtom, setNum, numCtx] = atom(1);

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
    </MarkUpdate>
  );
}

const Demo = () => (
  <Entry fns={[changeA]}>
    <SharedAtom />
  </Entry>
);

export default Demo;