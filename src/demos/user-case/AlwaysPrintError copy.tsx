import React from "react";
import { defineStore } from "@helux/store-pinia";
import { useEffect } from "helux";


const ruleStoreCtx = defineStore("ruleStore", {
  state: { a: 0 },
  actions: {
    async func() {
      console.log('-------> call func');
      try {
        throw new Error("123");
      } catch (error) {
        console.log('catch error in func', error);
        // throw error;
        this.a = 1;
        return { a: 1 };
      }
    },
    normal() {
      return 3000;
    }
  },
});

function App() {
  const store = ruleStoreCtx.useStore();

  useEffect(() => {
    // store.func().then(data => {
    //   console.log('useEffect data', data);
    // }).catch((error) => {
    //   console.log('useEffect error', error);
    // });

    const result = store.func();
    console.log('useEffect func result', result);

    // const result = store.normal();
    // console.log('useEffect normal', result);
  }, [store]);

  return <h1>Hello, React!{store.a}</h1>;
}

export default App;
