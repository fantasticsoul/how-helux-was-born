// @ts-nocheck
import React from "react";
import ReactDOM from "react-dom";
import { useMutable } from "helux";

const { produce, createDraft, finishDraft } = require('limu');
const data = {
  list: [],
}
const newData = produce(data, draft => {
  draft.list.push({
    name: '1',
    p: 500,
  });
  draft.list.sort((a, b) => b.p ?? 100 - a.p ?? 100);
});
console.log(newData);
const draft = createDraft(newData);
draft.list.push({
  name: '2',
  p: 1000,
});
draft.list.sort((a, b) => (b.p ?? 100) - (a.p ?? 100));
const x = finishDraft(draft);
console.log(x);

function App1(props) {
  console.log("Render App1");
  const [person, updatePerson] = props.useHook({
    current: 0,
    name: "Michel",
    age: 33,
    infos: [{ name: 1 }, { name: 2 }],
  });

  function updateName(name) {
    updatePerson((draft) => {
      draft.name = name;
      draft.infos[0].name = 100;
      draft.current = draft.infos[0].name;
    });
  }

  function becomeOlder() {
    updatePerson((draft) => {
      draft.age++;
    });
  }

  return (
    <div className="App">
      <h1>{props.label} Hello</h1>
      {/* <input
        onChange={(e) => {
          updateName(e.target.value);
        }}
        value={person.name}
      />
      <br /> */}
      <button onClick={updateName}>updateName</button>
      <button onClick={becomeOlder}>Older</button>
      {person.infos.map((v, idx) => (
        <div
          key={idx}
          onClick={() => {
            console.log("v", v);
          }}
        >
          {v.name}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  return (
    <>
      <App1 useHook={useMutable} label="useMutable" />
    </>
  );
}
