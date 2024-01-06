import { useState } from 'react';
import { block, share, derive, deriveDict } from 'helux';

const delay = (ms = 1000) => new Promise(r => setTimeout(r, ms));
const [obj, setObj, ctx] = share({ a: { a1: 1 }, b: 1 });
const result = derive({
  fn: () => obj.a.a1 + 1,
  task: async () => {
    await delay();
    return obj.a.a1 + 100;
  },
});
const result2 = deriveDict({
  deps: () => [obj.b] as const, // 定义依赖项
  fn: ({ input: [b] }) => ({ val: b + 1 }),// 定义初始值
  task: async ({ input: [b] }) => {
    await delay(1000);
    return { val: b + 1 };
  },
  immediate: true,
});



const { actions, useLoading } = ctx.defineActions()({
  // async changeA({draft}){
  //   await delay();
  //   draft.a.a1+=100;
  // },
  changeA({ draft }) {
    draft.a.a1 += 100;
  },
});

const User = block((props, params) => {
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
});

const User2 = block((props, params) => {
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
      {/* <User2 /> */}
      <button onClick={actions.changeA}>changeA</button>
    </div>
  );
}