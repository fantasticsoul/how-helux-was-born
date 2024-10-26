import React from 'react';
import { createStore } from "./store";

const store = createStore();

export default function App() {
  const [state] = store.useState();
  console.log("state.fullName =", state.fullName);

  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
    </div>
  );
}
