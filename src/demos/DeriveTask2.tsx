import { useState } from 'react';
import { block, share, derive, deriveDict, atom, mutate, $, getBlockParams } from 'helux';
import { noop } from './logic/util';

const delay = (ms = 1000) => new Promise(r => setTimeout(r, ms));
const [obj, setObj, ctx] = share({ a: { a1: 1 }, b: 1, c: 1 });
const [obj2, setObj2, ctx2] = atom({ a: { a1: 1 }, b: 1, c: 1 });

const result = derive({
  deps: (params) => {
    console.log('--->', params);
    return [params.state.a, params.stateRoot.a];
  },
  fn: () => obj.a.a1 + 1,
  task: async (params) => {
    console.log('---> task params', params);
    await delay();
    return obj.a.a1 + 100;
  },
}, obj);

const result1 = derive({
  deps: (bound) => [bound.state.a, bound.stateRoot.val.a],
  fn: () => obj.a.a1 + 1,
  task: async () => {
    await delay();
    return obj.a.a1 + 100;
  },
}, obj2);

const result2 = deriveDict({
  deps: (bound) => {
    console.log('deriveDict bound.state.c', bound.state.c);
    return [obj.b] as const; // 定义依赖项
  },
  fn: ({ input: [b] }) => ({ val: b + 1 }),// 定义初始值
  task: async ({ input: [b] }) => {
    await delay(1000);
    return { val: b + 1 };
  },
  immediate: true,
}, obj2);


mutate(obj, obj2)({
  fn: (draft, params) => {
    console.log(params, 'bound');
    console.log('params.extraBound.state.c', params.extraBound.state.c);
    draft.c = draft.b + 1;
  },
});


const { actions, useLoading } = ctx.defineActions()({
  async changeAAsync({ draft }) {
    await delay();
    draft.a.a1 += 100;
  },
  changeA({ draft }) {
    draft.a.a1 += 100;
  },
});

const User = block((props) => {
  const params = getBlockParams(props);
  const { status } = params; // 读取派生结果变化状态
  console.log(status);
  const [b] = params.read(result.val); // 通过 read 锁定依赖
  return (
    <div style={{ border: '1px solid green', padding: '6px', margin: '6px' }}>
      {status.ok && <div>b {b}</div>}
      {status.loading && <div>loading...</div>}
      {status.err && <div>{status.err.message}</div>}
    </div>
  );
}, true);

const User2 = block((props) => {
  const params = getBlockParams(props);
  const { status } = params; // 读取派生结果变化状态
  console.log(status);
  const [b] = params.read(result2.val); // 通过 read 锁定依赖
  return (
    <div style={{ border: '1px solid green', padding: '6px', margin: '6px' }}>
      {status.ok && <div>b {b}</div>}
      {status.loading && <div>loading...</div>}
      {status.err && <div>{status.err.message}</div>}
    </div>
  );
});

export default function Demo() {
  return (
    <div>
      <h3>updated at {new Date().toLocaleString()}</h3>
      <User />
      <User2 />
      <button onClick={actions.changeA}>changeA</button>
      <button onClick={actions.changeAAsync}>changeAAsync</button>
      <h3>{$(result.val)}</h3>
    </div>
  );
}