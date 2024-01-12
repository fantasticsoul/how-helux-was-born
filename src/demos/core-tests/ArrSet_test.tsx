import { $, atom, useAtom } from "helux";
import React from "react";

const delay = (ms = 1000) => new Promise((r) => setTimeout(r, ms));

const [state, setState] = atom([] as number[]);

const listBase = [1, 2, 3];

async function getList() {
  await delay(1000);
  const newList = state.val.slice().concat(listBase.slice());
  console.log("newList ", newList);
  return newList;
}

async function test() {
  const list = await getList();
  console.log("before", state.val);
  setState(list);
  console.log("after", state.val);
}

async function see() {
  console.log("now", state.val);
  console.log("now length", state.val.length);
}

export default function Test() {
  return (
    <div className="App">
      {$(state.val.length)}
      <button onClick={test}>test</button>
      <button onClick={see}>see</button>
    </div>
  );
}
