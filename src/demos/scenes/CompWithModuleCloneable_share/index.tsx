import { $, share } from 'helux';
import React from 'react';
import { ctx, action, deriveS, deriveM } from './module';
import { random, delay, getAtionFns } from "../../logic/util";
import { MarkUpdate, Entry } from "../../comps";

function test() {
  const a = action.actions.changeA(2);
  console.log(a);
}

function testF() {
  const a = action.actions.changeF(2);
  let c: undefined
  const b = action.eActions.changeF(2);
  // c = b.result;
  console.log(a);
}

function reactiveF() {
  ctx.reactive.f = 100;
  ctx.flush('reactiveF');
}

function Comp() {
  const [state] = ctx.useState();
  return (
    <MarkUpdate>
      state.f {state.f}
    </MarkUpdate>
  );
}


function Comp2() {
  return (
    <MarkUpdate>
      ctx.state.f {$(ctx.state.f)}
    </MarkUpdate>
  );
}

function Comp3() {
  const [state] = deriveM.useDerivedState();
  return (
    <MarkUpdate>
      state.c {state.c}
    </MarkUpdate>
  );
}

const Demo = () => (
  <Entry fns={getAtionFns(action.actions, [test, testF, reactiveF])}>
    <Comp />
    <Comp2 />
    <Comp3 />
    <div>ctx.state.f {$(ctx.state.f)}</div>
    <div>ctx.state.g {$(ctx.state.g)}</div>
    <div>ctx.state.k {$(ctx.state.k)}</div>
    <div>ctx.state.j {$(ctx.state.j)}</div>
  </Entry>
);

export default Demo;
