import React from 'react';
import { mutate, share, useAtom, $ } from 'helux';
import { MarkUpdate, Entry } from '../comps';
import { dictFactory, delay } from '../logic/util';

const [priceState, setPrice, ctxp] = share(dictFactory, { moduleName: 'DefineApi' });


export type DepsResult = { deps: any[], result: any };

// 约束各个函数入参类型
type Payloads = {
  changeA: [number, number];
  // foo: boolean | undefined;
};

const { actions, useLoading, getLoading } = ctxp.defineActions<Payloads>({
  changeA({ draft, payload }) {
    draft.a.b.c = 200;
  },
  async foo({ draft, payload }) {
    await delay(3000);
    draft.a.b.c += 1000;
  },
});
actions.foo(true)

type DR = {
  a: { result: number };
  // b: { result: number };
  c: { deps: [number, string], result: number };
};

const fd = ctxp.defineFullDerive<DR>({
  a() {
    return priceState.a.b.c + 10000;
  },
  b() {
    return priceState.a.b.c + 20000;
  },
  c: {
    deps: () => [priceState.a.b1.c1, priceState.info.name],
    fn: () => 1,
    async task(params) {
      const [c1, name] = params.input;
      await delay(2000);
      return 1 + c1;
    },
  }
});

const a = fd.derivedResult.a;
const c = fd.derivedResult.c;
// a.z__is_atom_result__
// a.__helux_ts_type_helper_attr__

// a.val
// console.log('---> ', a.val);
// console.log('---> ', c.val);

// const md = ctxp.defineMutateDerive({
//   a: 1, b: '2', c: 3
// }, {
//   changeA: (draft) => draft.a = priceState.a.b.c + 100,
//   changeB: {
//     deps: () => [priceState.info.name],
//     async task(params) {
//       await delay(1000);
//       params.draft.b = priceState.info.name + 'ccc';
//     },
//   }
// });

ctxp.mutate({
  async task({ setState }) {
    console.error('---->>> mutate task');
    setState(draft => { draft.a.b.c = 1 });
  },
  // immediate: false,
})

function changeC() {
  ctxp.reactive.a.b.c++;
}

function changeC1() {
  ctxp.setState(draft => { draft.a.b1.c1++ });
  // ctxp.reactive.a.b1.c1++;
}

function Price() {
  const [price, , info] = useAtom(priceState);
  const [ld] = useLoading();
  const [a, status] = fd.helper.a.useDerived();
  const [c, status2] = fd.helper.c.useDerived();

  return <MarkUpdate name="Price" info={info}>
    {price.a.b.c}
    <h3>{ld.foo.loading ? 'foo is running' : 'foo is done'}</h3>
    <h3>derived a: {a} {status.loading ? 'loading...' : ''}</h3>
    <h3>derived c ( dep a.b1.c1 ): {c} {status2.loading ? 'loading...' : ''}</h3>
  </MarkUpdate>;
}

function C1() {
  const [state, , info] = ctxp.useState();

  return <MarkUpdate name="Price" info={info}>
    state.a.b1.c1: {state.a.b1.c1}
  </MarkUpdate>;
}

const Demo = () => (
  <Entry fns={[actions.foo, changeC1, changeC]}>
    <Price />
    <Price />
    <C1 />
    {/* <h3>ctxp.reactive.a.b.c: {$(ctxp.reactive.a.b.c)}</h3>
    <h3>ctxp.reactive.a.b1.c1: {$(ctxp.reactive.a.b1.c1)}</h3>
    <h3>ctxp.state.a.b1.c1: {$(ctxp.state.a.b1.c1)}</h3> */}
    <h3>getLoading().foo.loading: {$(getLoading().foo.loading)}</h3>
    <h3>getLoading().foo.loading: {$(() => <h1>foo.loading:{`${getLoading().foo.loading}`}</h1>)}</h3>
    <h3>true:{true}</h3>
  </Entry>
);

export default Demo;
