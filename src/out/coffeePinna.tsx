import { useState } from "react";
import { sharex, block, type Fn } from "helux";

type Dict<T = any> = Record<string, T>;

type GetterType<T extends any> = T extends Fn ? ReturnType<T> : unknown;

type GettersType<T extends any>
  = ('getters' extends keyof T ? { [K in keyof T['getters']]: GetterType<T['getters'][K]> } : {});

type StateType<T extends Dict>
  = ('state' extends keyof T ? { [K in keyof T['state']]: T['state'][K] } : {});

type ActionsType<T extends Dict>
  = ('actions' extends keyof T ? { [K in keyof T['actions']]: (...args: any[]) => ReturnType<T['actions'][K]> } : {});

type StoreType<T extends Dict> = StateType<T> & ActionsType<T> & GettersType<T>;

type PayloadType<T extends Dict, K extends string> = K extends keyof T ? T[K] : any;

// interface IDefineStoreOptions<S extends Dict = any, G extends Dict<Fn> = any, P extends Dict = any> {
interface IDefineStoreOptions<S extends any = any, G = any, P extends Dict = any> {
  state: S,
  getters: Dict<(state: S, draft: any) => any>,
  actions: {
    [K in string]: (params: { state: S, getters: GetterType<G>, payload: PayloadType<P, K> }) => any;
  },
}

// 递归序列化函数（处理循环引用）
function serialize(obj: any, seen = new WeakSet()) {
  if (seen.has(obj)) return "[Circular]"; // 处理循环引用
  seen.add(obj);

  if (obj instanceof Date) return obj.toISOString();
  if (obj instanceof RegExp) return obj.toString();
  if (typeof obj !== "object" || obj === null) return obj;

  const result: any = {};
  for (const key of Reflect.ownKeys(obj)) {
    // 跳过Proxy内部属性
    // @ts-ignore
    if (key.startsWith("__proto__") || key === "constructor") continue;
    const v = obj[key];
    if (
      typeof v === "number" ||
      typeof v === "string" ||
      typeof v === "boolean" ||
      v === undefined
    ) {
      result[key] = v;
    } else {
      result[key] = serialize(v, seen);
    }
  }
  return result;
}

function defineStore<T extends IDefineStoreOptions>(options: T) {
  const ctx = sharex(options.state, {
    mutate: {
      test(params){

      }
    }
  });

  // 使用 defineMutateDerive 来承接 getters 定义
  const mutateDeriveInput: any = {};
  Object.keys(options.getters || {}).forEach((key) => {
    mutateDeriveInput[key] = (draft: any) => options.getters[key](ctx.state, draft);
  });
  const dm = ctx.defineMutateDerive({} as any)(mutateDeriveInput);

  // 使用 defineActions 来承接 actions 定义
  const actionsTmp: any = {};
  Object.keys(options.actions).forEach((key) => {
    actionsTmp[key] = ({ draft, payload }: any) => {
      return options.actions[key]({ state: draft, payload, getters: dm.derivedState });
    };
  });
  const { actions, useLoading, getLoading } = ctx.defineActions()(actionsTmp);


  return {
    useStore: () => {
      const [reactive] = ctx.useReactive();
      const [derived] = dm.useDerivedState();
      // store definition
      return new Proxy(options, {
        get(obj, prop: string) {
          // 返回 store.state 值
          if (prop in reactive) {
            return reactive[prop];
          }
          // 返回 store.actions 方法
          if (prop in actions) {
            return actions[prop];
          }
          // 返回 store.getters 结果
          if (prop in derived) {
            return derived[prop];
          }
          if (prop === "toJSON") {
            // 这里打印不出来，需要补充serialize函数
            // return () => serialize(reactive)
            return JSON.stringify(reactive);
          }
        },
        set(obj, prop: string, value) {
          if (prop in reactive) {
            reactive[prop] = value;
            return true;
          }
          console.log(`key ${prop} not in state`);
          return false;
        },
      }) as unknown as StoreType<T>;
    },
    useLoading,
    getLoading,
    // 方便提供给 block 做绑定
    state: ctx.state as StateType<T>,
    // 方便提供给 block 做绑定
    reactive: ctx.reactive as StateType<T>,
    getters: dm.derivedState as GettersType<T>,
  };
}

//   ^^^^^^^^^^^^^^^^^^^
//   以上是封装的帮助函数
//----------------------------------------------------------------
//   以下是函数的使用示例
//   vvvvvvvvvvvvvvvvvvvv

const storeCtx = defineStore({
  state: {
    a: 1,
    b: { c: "" },
    c: 1,
    d: true,
  },
  getters: {
    e: (state) => {
      // 不是用this, 函数参数第一个是state
      return state.a + 1;
    },
    f(state, getters) {
      // 使用state, getter
      return state.a + getters.e;
    },
  },
  actions: {
    /** setA method */
    setA({ state, payload }) {
      state.a = payload;
    },
    setB({ state, payload, getters }) {
      // 使用state，getter
      state.b.c = payload + state.a + getters.e;
    },
    async setC({ state, payload }) {
      await new Promise((r) => setTimeout(r, 1000));
      state.c = payload;
    },
  },
});
const { state, getters, useStore } = storeCtx;

export function Test1() {
  const store = useStore();
  console.log("test1 render", store, JSON.stringify(store));

  return (
    <>
      <div>
        test1:
        <div>store = {JSON.stringify(store)}</div>
      </div>
    </>
  );
}

export function Test2() {
  const store = useStore();
  const [count, setCount] = useState(0);
  const [vv, setV] = useState(0);

  function onInput1(e: any) {
    setCount(e.target.value);
    const v = Math.random();
    setV(v);
    console.log("onInput1 setA", v);
    store.setA(v);
  }

  function onInput2(e: any) {
    setCount(e.target.value);
    const v = Math.random();
    setV(v);
    console.log("onInput2 setB", v);
    store.setB(v);
  }

  function onInput3(e: any) {
    setCount(e.target.value);
    const v = Math.random();
    setV(v);
    console.log("onInput3 setC", v);
    store.setC(v);
  }

  function onInput4(e: any) {
    setCount(e.target.value);
    const v = Math.random();
    setV(v);
    console.log("onInput4 reactive", v);
  }

  function onInput5(e: any) {
    setCount(e.target.value);
    const v = Math.random();
    setV(v);
    console.log("onInput5 reactiveRoot", v);
  }

  console.log("test2 render", count, store);

  return (
    <>
      <div>test2: {vv}</div>
      <div>
        setA
        <input value={count} onChange={onInput1} />
        setB=
        <input value={count} onChange={onInput2} />
        setC=
        <input value={count} onChange={onInput3} />
      </div>
      <div>
        reactive=
        <input value={count} onChange={onInput4} />
        reactiveRoot.val=
        <input value={count} onChange={onInput5} />
      </div>
    </>
  );
}

export function Test3() {
  const store = useStore();
  console.log("test3 render");
  return (
    <>
      <div>
        test3
        <div>store.a = {store.a}</div>
        <div>store.e = a + 1 = {store.e}</div>
        <div>store.f = a + a + 1 = {store.f}</div>
        <div>store.c = {store.c}</div>
      </div>
    </>
  );
}

export function Test4() {
  const store = useStore();
  console.log("test4 render");

  return (
    <>
      <div>
        test4:
        <div>store.b = setB = a+e = {JSON.stringify(store.b)}</div>
      </div>
    </>
  );
}

export function Test5() {
  const store = useStore();
  console.log("test5 render");

  return (
    <>
      <div>
        test5:
        <div>store.b.c = {store.b.c}</div>
      </div>
    </>
  );
}

export const Test3Block = block(() => {
  return (
    <>
      <div>
        Test3Block
        <div>store.a = {state.a}</div>
        <div>store.e = a + 1 = {getters.e}</div>
        <div>store.f = a + a + 1 = {getters.f}</div>
        <div>store.c = {state.c}</div>
      </div>
    </>
  );
});

export const Test4Block = block(() => {
  const store = useStore();
  console.log("Test4Block render");

  return (
    <>
      <div>
        Test4Block:
        <div>store.b = setB = a+e = {JSON.stringify(store.b)}</div>
      </div>
    </>
  );
});

export const Test5Block = block(() => {
  return (
    <>
      <div>
        Test5Block:
        <div>store.b.c = {state.b.c}</div>
      </div>
    </>
  );
});

export default function Test() {
  return (
    <>
      <Test1 />
      <Test2 />
      <div style={{ display: "flex" }}>
        <Test3 />
        <Test4 />
        <Test5 />
      </div>
      <div style={{ display: "flex" }}>
        <Test3Block />
        <Test4Block />
        <Test5Block />
      </div>
    </>
  );
}
