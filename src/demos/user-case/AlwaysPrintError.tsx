import React from "react";
import { defineStore } from "@helux/store-pinia";
import { useEffect } from "helux";

const ruleStoreCtx = defineStore("ruleStore", {
  state: { a: { num: 1 } },
  actions: {
    async func() {
      try {
        throw new Error("123");
      } catch (error) {
        throw error;
        // return { a: 2000 };
        // return this.a;
      }
    },
    func2() {
      try {
        throw new Error("333");
      } catch (error) {
        throw error;
        // return { a: 2000 };
        // return 2222;
      }
    },
  },
});

function App() {
  console.log('Render AlwaysPrintError');
  const store = ruleStoreCtx.useStore();

  useEffect(() => {
    console.log('call useEffect');
    // store.func().then(data => {
    //   console.log('useEffect data', data);
    //   // setTimeout(() => {
    //   //   data.num = 100;
    //   // }, 3000);
    // }).catch((error) => {
    //   console.log('useEffect catch error', error);
    // });

    try {
      store.func2();
    } catch (err) {
      console.log('func2 useEffect catch error', err);
    }

    // const result = store.func();
    // console.log('useEffect func result', result);

    // const result = store.normal();
    // console.log('useEffect normal', result);
  }, [store]);

  return <h1>Hello, React!<p>{store.a.num}</p></h1>;
}

export default App;
