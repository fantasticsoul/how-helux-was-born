import { share, deriveAtom, useShared, watch, shallowCompare, $, useWatch, currentDraftRoot } from 'helux';
import { getVal } from '@helux/utils';
import React from 'react';
import { MarkUpdate, Entry } from '../comps';
import { random, delay, noop } from "../logic/util";


const [shared, setShared, ctx] = share({
  a: {
    b: { c: 1 },
    b1: { c1: 1 },
  },
  info: { name: 'helux', age: 1 },
  desc: 'awesome lib',
  extra: {
    mark: 'extra',
    list: [
      { id: 1, name: 'helux1' },
      { id: 2, name: 'helux2' },
    ],
  }
}, {
  stopArrDep: true,
});


const changeABC = () => {
  setShared((draft) => {
    draft.a.b.c += 1;
  });
};
const plusAge = () => setShared(draft => { draft.info.age += 1 });
const minusAge = () => setShared(draft => { draft.info.age -= 1 });
const changeShared = () => {
  setShared((draft) => {
    draft.info = { ...draft.info };
  });
};
const changeDesc = () => {
  setShared((draft) => {
    draft.desc = `${Date.now()}`;
  });
};
const changeList0 = () => {
  setShared((draft) => {
    draft.extra.list[0].name = `name:${Date.now()}`;
  });
};
const resetList = () => {
  setShared((draft) => {
    draft.extra.list = draft.extra.list.slice();
  });
};
const changeExtra = () => {
  setShared((draft) => {
    draft.extra = { ...draft.extra };
  });
};

// 💢 触发执行，因为 info 引用已变化
function Info() {
  console.log('----------------------------------------');
  const [state, , info] = useShared(shared, { deps: state => [] });
  React.useEffect(() => {
    console.log('Info React.useEffect state changed');
  }, [state]);
  useWatch((params) => {
    console.log('Info useWatch state changed', params.isFirstCall);
  }, () => [state]);

  return <MarkUpdate info={info}>state.desc {state.desc}</MarkUpdate>

  // noop(state.info);

  // if (state.info.age === 2) {
  //   return <MarkUpdate info={info}>only info.age {state.info.age}</MarkUpdate>
  // }
  // noop(state.extra.list[0]);
  // // noop(state.extra.list[1]);

  // return <MarkUpdate info={info}><h2>arrDep=true,arrIndexDep=true {state.info.age} </h2></MarkUpdate>;
}

function Info1() {
  console.log('%c Render Info1', 'color:blue;');
  const [state, , info] = useShared(shared, { pure: true, arrDep: false });
  const { age } = state.info;
  noop(state.extra.list[0].name);
  noop(state.extra.list[1]);

  if (age === 2) {
    return <MarkUpdate info={info}>(age {age}) a.b.c: {state.a.b.c}</MarkUpdate>
  }
  if (age === 3) {
    noop(state.a);
    return <MarkUpdate info={info}>(age {age})</MarkUpdate>
  }

  return <MarkUpdate info={info}>(age {age}) a.b1.c1: {state.a.b1.c1}</MarkUpdate>

  // return <MarkUpdate info={info}><h2>arrDep=false {state.info.age}</h2></MarkUpdate>;
}

function Info2() {
  const [state, , info] = useShared(shared, { pure: true, arrIndexDep: false });
  noop(state.info);

  if (state.info.age === 2) {
    return <MarkUpdate info={info}>only info.age {state.info.age} </MarkUpdate>
  }
  noop(state.extra.list[0]);
  console.log(info.getDeps());
  noop(state.extra.list[1]);

  return <MarkUpdate info={info}><h2>arrIndexDep=false  {info.insKey} {state.info.age}</h2></MarkUpdate>;
}


const Demo = () => (
  <Entry fns={[plusAge, minusAge, changeDesc, changeShared, changeList0, changeExtra, resetList, changeABC]}>
    <Info />
    <Info1 />
    {/* <Info2 /> */}
    {/* <Info />
    <Name />
    <Age /> */}
  </Entry>
);

export default Demo;