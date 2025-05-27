import { type IDefineStore } from './types';
import { defineStore as defineStoreFn } from './store';

export const defineStore = defineStoreFn as unknown as IDefineStore;

const storeCtx = defineStore({
  state: () => ({ a: 1 }),
  getters: {
    b() {
      return this.a + 1;
    },
  },
  actions: {
    foo() {
      this.a = Date.now();
    },
  },
});


storeCtx.actions.foo
