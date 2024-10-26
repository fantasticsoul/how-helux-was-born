import { $, share, atom, deriveDict, derive, block, useAtom } from 'helux';
import React from 'react';
import { Entry } from './comps';
import { random, delay } from "./logic/util";


const [sharedState, setState] = share({ a: 1, b: { b1: { b2: 200 }, b12: 100 }, name: Date.now() });
// mutate state out of react component
function changeB2() {
  setState((draft) => {
    draft.b.b1.b2 += 100;
  });
}

const UserBlock = block(() => <>
  <h1>ruikun name {sharedState.name}</h1>
  <h1>{sharedState.a}</h1>
  <div>
    {$(() => <h1>see e cool nested gogo ee gogo: {sharedState.b.b1.b2}</h1>)}
  </div>
</>);

function RuiKun() {
  console.error('Render RuiKun');
  return <div>
    <h4>RuiKun long content</h4>
    <h3>state.name: {$(sharedState.name)}</h3>
  </div>
}

function RuiKun2() {
  console.error('Render RuiKun2');
  return <div>
    <h4>RuiKun2 long content</h4>
    <h3>state.b.b1.b2: {$(sharedState.b.b1.b2)}</h3>
  </div>
}

function RuiKun3() {
  console.error('Render RuiKun3');
  return <div>
    <h4>RuiKun3 long content</h4>
    <h3>state.b.b12: {$(sharedState.b.b12)}</h3>
    {/* <h3>state.b.b12: {sharedState.name}</h3> */}
  </div>
}

function RuiKun4() {
  // const [state] = ctx.useState();
  const [state] = useAtom(sharedState);
  console.error('Render RuiKun4');
  return <div>
    <h4>RuiKun3 long content</h4>
    <h3>state.name: {state.name}</h3>
  </div>
}

function changeName() {
  setState(draft => { draft.name = Date.now() });
}

function changeB22() {
  setState(draft => { draft.b.b1.b2 = Date.now() });
}

function changeB212() {
  setState(draft => { draft.b.b12 = Date.now() });
}

const Demo = () => (
  <Entry fns={[changeB2, changeName, changeB22, changeB212]}>
    <RuiKun />
    <RuiKun2 />
    <RuiKun3 />
    <RuiKun4 />
    <UserBlock />
    <h1>
      see {$(sharedState.b.b1.b2)}
    </h1>
  </Entry>
);

export default Demo;
