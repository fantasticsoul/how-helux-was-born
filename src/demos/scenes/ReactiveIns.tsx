import * as helux from 'helux';
import { getVal } from '@helux/utils';
import React from 'react';
import { MarkUpdate, Entry } from '../comps';
import { dictFctory } from "../logic/util";

console.log(helux);
const { share, atom, useReactive } = helux;

const [shared, , sctx] = share(dictFctory);

const [atomDict, , ctx] = atom(dictFctory);

function Info1() {
  const [reactiveShared] = useReactive(shared);
  React.useEffect(() => {
    // setInterval(() => reactiveShared.a.b.c++, 1000);
  }, []);

  return <MarkUpdate>
    <h2>reactiveShared.a.b.c {reactiveShared.a.b.c}</h2>
  </MarkUpdate>;
}

function updateC1() {
  sctx.reactive.a.b.c++;
  sctx.reactive.a.b.c++;
  sctx.reactive.a.b.c++;
}
function updateC2() {
  ctx.reactive.val.a.b.c++;
  ctx.reactive.val.a.b.c++;
  ctx.reactive.val.a.b.c++;
}

function Info2() {
  const [reactiveShared] = useReactive(atomDict);
  React.useEffect(() => {
    // setInterval(() => reactiveShared.val.a.b.c++, 1000);
  }, []);
  const add = () => reactiveShared.val.a.b.c++;

  return <MarkUpdate>
    <button onClick={add}>add</button>
    <h2>reactiveShared.a.b.c {reactiveShared.val.a.b.c}</h2>
  </MarkUpdate>;
}

function InfoRead() {
  const [reactiveShared] = useReactive(atomDict);
  const add = () => reactiveShared.val.a.b.c++;
  return <MarkUpdate>
    <button onClick={add}>add</button>
    <h2>reactiveShared.a.b.c {reactiveShared.val.a.b.c}</h2>
  </MarkUpdate>;
}


const Demo = () => (
  <Entry fns={[updateC1, updateC2]}>
    <Info1 />
    <Info1 />
    <Info2 />
    <InfoRead />
    <InfoRead />
  </Entry>
);

export default Demo;

