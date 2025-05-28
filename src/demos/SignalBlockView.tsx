import { $, share, atom, deriveDict, derive, block, useAtom, getBlockParams, BlockView, SignalView } from 'helux';
import React from 'react';
import { Entry } from './comps';
import { random, delay } from "./logic/util";


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


const getProps = () => {
  const val1 = doubleNum.val;
  const val2 = numAtom.val;
  const val3 = sharedState.a;
  const b12 = sharedState.b.b12;
  const val4 = aPlusB2Result.val;
  return { val1, val2, val3, val4, b12 };
};
const AsyncBlockPure = (props: ReturnType<typeof getProps>): JSX.Element => {
  const { status } = getBlockParams(props);
  if (status.loading) return <span>is loading...</span>;
  const { val1, val2, val3, val4, b12 } = props;

  return (
    <div className="box">
      <h3>AsyncBlockPure</h3>
      <h3>b.b12: {b12}</h3>
      <h3>A: {val1}</h3>
      <h3>{val2}</h3>
      <h3>{val3}</h3>
      <h3>{val4}</h3>
      <div>
        {$(() => <h1>nested: {sharedState.b.b1.b2}</h1>)}
      </div>
    </div>
  );
};


function changeName() {
  setState(draft => { draft.name = Date.now() });
}

const Name = React.forwardRef((props: any, b: any) => {
  const { first, last } = props;
  console.log('b', b);
  console.log(props);
  return <div>{`name is ${first} ${last}`}</div>;
});


const getProps2 = () => {
  const { first, last } = sharedState.info.name;
  return { first, last };
};


type Data = ReturnType<typeof getProps>;
type Other = { label: string };

const useStatusList = () => {
  const { changeB12Sync } = ac.useLoading();
  return [changeB12Sync];
};


const Label = (val: any) => {
  return `first val ${val.first}, last is ${val.last}`;
}

const Demo = () => {
  const ref = React.useRef(null);
  const list = useStatusList();
  console.log('loading', list[0].loading);

  const status = ac.useLoading().changeB12Sync;
  if (status.loading) return <span>is loading...</span>;

  // @ts-ignore
  const badCase = <SignalView input={sharedState.info.name.first} />;
  return (
    <Entry fns={[changeB2, changeA, changeAtom, changeName, changeB12Sync, ac.actions.changeB12Sync, ac.actions.changeB12Sync_2]}>
      <BlockView data={getProps2} comp={Name} ref={ref} />

      {$(sharedState.info.name.first)}<br />
      {$(sharedState.info.name, val => `first val ${val.first}, last is ${val.last}`)}<br />
      {badCase}<br />
      <SignalView input={() => sharedState.info.name.first} format={val => `first val -> ${val}`} /><br />
      <SignalView input={() => sharedState.info.name} format={val => `first val ${val.first}, last is ${val.last}`} /><br />
      <SignalView input={() => sharedState.info.name} format={Label} /><br />
      <BlockView data={() => sharedState.info.name} comp={Label} /><br />

      {/* {$(sharedState.info.name.first)}<br />
      {$(sharedState.info.name, (val) => `first val ${val.first}, last is ${val.last}`)} */}

      {/* <BlockView<Data, Other> data={getProps} comp={AsyncBlockPure} useStatusList={useStatusList} label="label" /> */}
      <button onClick={() => setState(draft => void (draft.info.name.first = `${Date.now()}`))}>change sharedState.info.name.first</button>
    </Entry>
  );
};

export default Demo;
