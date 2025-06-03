import { $, share, atom, deriveDict, derive, block, useAtom, getBlockParams, BlockView, BlockV2, SignalView } from 'helux';
import React from 'react';
import { Entry } from '@/demos/comps';
import { random, delay } from "@/demos/logic/util";

const [sharedState, setState, ctx] = share({
  a: 1, b: { b1: { b2: 200 }, b12: 100 }, name: Date.now(),
  info: {
    name: { first: 'first', last: 'last' },
    addrs: [{ name: 'bj' }, { name: 'sh' }],
  },
}, { moduleName: 'Signal2' });
const aPlusB2Result = deriveDict({
  fn: () => ({ val: 0 }),
  deps: () => [sharedState.a, sharedState.b.b1.b2],
  task: async () => {
    const [a, b2] = [sharedState.a, sharedState.b.b1.b2]
    await delay(1000);
    return { val: a + b2 + random() };
  }
});

const [numAtom, setAtom] = atom(100);
const doubleNum = derive(() => {
  return numAtom.val * 2 + sharedState.a;
});

const nameFistSuffix = derive(() => {
  return sharedState.info.name.first + '_siffix';
});

const nameFistSuffix2 = derive({
  deps: () => [sharedState.info.name.first],
  fn: ({ input }) => `${input[0]}_init`,
  task: async () => {
    await delay(1000);
    return sharedState.info.name.first + '_async_siffix';
  },
});

// mutate state out of react component
function changeB2() {
  setState((draft) => {
    draft.b.b1.b2 += 100;
  });
}

function changeA() {
  setState((draft) => {
    draft.a += 1;
  });
}

const ac = ctx.defineActions()({
  async changeB12Sync({ draft }) {
    await delay(3000);
    draft.b.b12 = Date.now();
  },
  async changeB12Sync_2({ draft }) {
    await delay(3000);
    draft.b.b12 = Date.now();
  },
});

const changeB12Sync = ctx.action()(async ({ draft }) => {
  await delay(1000);
  draft.b.b12 = Date.now();
}, 'changeB12Sync');


function changeAtom() {
  setAtom(numAtom.val + 100);
}


function changeName() {
  setState(draft => { draft.name = Date.now() });
}


const useStatusList = () => {
  const { changeB12Sync } = ac.useLoading();
  return [changeB12Sync];
};


const Label = (val: any) => {
  return `first val ${val.first}, last is ${val.last}`;
}

const btn = <button onClick={() => setState(draft => void (draft.info.name.first = `${Date.now()}`))}>change sharedState.info.name.first</button>;

const Demo = () => {
  const ref = React.useRef<any>(null);
  const [name, setName] = React.useState('BlockView22');
  const [other, setOther] = React.useState('other');
  // const list = useStatusList();
  // console.log('loading', list[0].loading);

  const status = ac.useLoading().changeB12Sync;
  if (status.loading) return <span>is loading...</span>;

  // @ts-ignore
  // const badCase = <SignalView input={sharedState.info.name.first} />;
  return (
    <Entry fns={[changeB2, changeA, changeAtom, changeName, changeB12Sync, ac.actions.changeB12Sync, ac.actions.changeB12Sync_2]}>
      {/* <SignalView
        input={() => `-first val ${sharedState.info.name.first}, -last is ${sharedState.info.name.last}`}
        format={(result) => `result is: ${result}`}
      /> */}
      <br />
      {btn}
      <button onClick={() => setName(`local_${Date.now()}`)}>change local name</button>
      <button onClick={() => setOther(`other_${Date.now()}`)}>change other</button>
      <button onClick={() => ref.current?.hello()}>call hello</button>
      <div>local name: {name}</div>
      <div>other: {other}</div>
    </Entry>
  );
};

const EComp = () => <div><Demo /></div>;
// const EComp = ()=><div><Demo />{$(NameBlock, true)}</div>;
// const EComp = ()=><div>{$(NameBlock, true)}{btn}</div>;
// const EComp = () => <div>{$(() => numAtom)}{btn}</div>;
// const EComp = () => <div>{$(() => <NameBlock />)}{btn}</div>;

export default EComp;

