import { defineMutateFnItem } from 'helux';
import { Draft, MutateFnItem } from './mutateState';
import type { BoundStateInfo } from './state';

const toExport = ({ state }: BoundStateInfo) => ({
  plusAByB(draft: Draft) {
    draft.a = draft.b + 1;
  },

  changeC(draft: Draft) {
    console.error('c is watching j', state.j + 1);
    draft.c = state.j + 1;
  },

  /**
   * MutateFnItem<[number]> 约束了 deps 返回类型和 task 里的 input 类型
   */
  changeDTask: defineMutateFnItem<MutateFnItem<[number]>>({
    deps: () => [state.j],
    task: async ({ draft, input }) => {
      draft.d = input[0] + 1;
    },
  }),
});

export default toExport;
