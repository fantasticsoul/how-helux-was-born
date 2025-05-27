import { sharex } from 'helux';

const ctx = sharex({
  total: 122,
  totalPlus: 0,
  totalPlus2: 110,
  time: 0,
}, { moduleName: 'RawHelux' });

ctx.defineMutateSelf()({
  // 由 state 派生出 totalPlus，上游依赖不变化时此函数不再重复计算
  totalPlus(draft) {
    draft.totalPlus = draft.total + 10;
  },
  // 由其他 getters 派生出 totalPlus2，上游依赖不变化时此函数不再重复计算
  totalPlus2(draft) {
    draft.totalPlus2 = draft.totalPlus + 100;
  },
});

const { actions } = ctx.defineActions()({
  changeTotal({ draft }) {
    draft.total = Date.now();
  }
});

export const store = {
  // state: ctx.state,
  state: ctx.reactive,
  useState: ctx.useState,
  useReactive: ctx.useReactive,
  actions,
}

