/**
 * 本实例演示了：
 * 1 定义共享状态
 * 2 定义修改状态的方法
 * 3 组件获取状态，调用方式，以及获取方法运行状态
 */
import React from 'react';
import { sharex } from 'helux';

interface IBook {
  id: string;
  name: string;
  price: number;
}

/**
 * 大多数时候状态是一个字典，使用 sharex 创建共享对象，返回 share context
 * moduleName 是可选的，赋值是为了方便映射到 redux devtool 状态树上
 */
const ctx = sharex({ list: [] as IBook[], page: 1, size: 10, total: 0 }, { moduleName: 'bookshop' });

/** 确定不同函数的 payload 类型 */
type Payloads = {
  fetchList: { page: number, size: number };
};

const { actions, useLoading } = ctx.defineActions<Payloads>()({
  async fetchList({ draft, payload }) {
    console.log(payload.page, payload.size);
    const { list, total } = await Promise.resolve({ list: [{ id: '1', name: 'b1', price: 100 }], total: 10 });
    draft.list = list;
    draft.total = total;
  },
});

function Shop() {
  const [state] = ctx.useState();
  const ld = useLoading();
  // fetchList 的运行状态，如关系其他函数运行状态，可从 ld 继续解构获取到
  const { loading, err, ok } = ld.fetchList;

  return (
    <div>
      {loading && <h1>fetching books</h1>}
      {err && <h1>{err.message}</h1>}
      {ok && state.list.map((v) => <span>name:{v.name} price:{v.price}</span>)}
      <button onClick={() => actions.fetchList({ page: 1, size: 10 })}>more</button>
    </div>
  );
}

export const BestPractice = React.memo(Shop);
