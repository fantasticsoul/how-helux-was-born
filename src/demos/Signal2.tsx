// @ts-nocheck
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

const changeFirstName = () => {
  ctx.reactive.info.name.first = `${new Date().getTime()}`;
};

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

function changeAtom() {
  setAtom(numAtom.val + 100);
}

const AsyncBlock = block((props) => {
  const { status } = getBlockParams(props);
  const val1 = doubleNum.val;
  const val2 = numAtom.val;
  const val3 = sharedState.a;
  const val4 = aPlusB2Result.val;
  if (status.loading) return 'is loading...';

  return (
    <div className="box">
      <h1>AsyncBlock</h1>
      <h1>{val1}</h1>
      <h1>{val2}</h1>
      <h1>{val3}</h1>
      <h1>{val4}</h1>
      <div>
        {$(() => <h1>nested: {sharedState.b.b1.b2}</h1>)}
      </div>
    </div>
  );
}, true);


const getProps = () => {
  const val1 = doubleNum.val;
  const val2 = numAtom.val;
  const val3 = sharedState.a;
  const val4 = aPlusB2Result.val;
  return { val1, val2, val3, val4 };
};
const AsyncBlockPure = (props: ReturnType<typeof getProps>): JSX.Element => {
  const { status } = getBlockParams(props);
  if (status.loading) return <span>is loading...</span>;
  const { val1, val2, val3, val4 } = props;

  return (
    <div className="box">
      <h3>AsyncBlockPure</h3>
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

const changeNameSync = ctx.action()(async ({ draft }) => {
  await delay(1000);
  draft.name = Date.now();
}, 'changeNameSync');

function changeB22() {
  setState(draft => { draft.b.b1.b2 = Date.now() });
}

function changeB212() {
  setState(draft => { draft.b.b12 = Date.now() });
}

const Name = React.forwardRef((props: any, b: any) => {
  const { first, last } = props;
  console.log('b', b);
  console.log(props);
  return <div>{`name is ${first} ${last}`}</div>;
});


const Name2 = React.memo((props: any, b: any) => {
  const { first, last } = props;
  console.log('b', b);
  console.log(props);
  return <div>{`name is ${first} ${last}`}</div>;
});


const getProps2 = () => {
  const { first, last } = sharedState.info.name;
  return { first, last };
};

console.log('BlockView', BlockView);

const getProps222 = () => {
  const val1 = doubleNum.val;
  return { val1 };
};

type Data = ReturnType<typeof getProps>;
type Other = { label: string };


const UserBlock = block((props, ref) => {
  const { status } = getBlockParams(props);
  console.log('props', props, 'ref', ref, 'status', status);

  if (status.loading) return 'loading...';

  return (<>
    <h1>ruikun name {sharedState.name}</h1>
    <h1>{doubleNum.val}</h1>
    <h1>{numAtom.val}</h1>
    <h1>{sharedState.a}</h1>
    <div>
      {$(() => <h1>see e cool nested gogo ee gogo: {sharedState.b.b1.b2}</h1>)}
    </div>
  </>);
}, true);

const getData2 = () => {
  return { d: doubleNum.val, n: numAtom.val, s: sharedState.a, name: sharedState.name }
}

const User2 = (props, ref) => {
  const { status } = getBlockParams(props);
  const { d, n, s, name } = props;
  console.log('props', props, 'ref', ref, 'status', status);

  if (status.loading) return 'loading...';
  return (<>
    <h1>ruikun name {name}</h1>
    <h1>{d}</h1>
    <h1>{n}</h1>
    <h1>{s}</h1>
    <div>
      {$(() => <h1>see e cool nested gogo ee gogo: {sharedState.b.b1.b2}</h1>)}
    </div>
  </>);
}


const Demo = () => {
  const ref = React.useRef(null);
  return (
    <Entry fns={[changeB2, changeA, changeAtom, changeName, changeNameSync, changeB22, changeB212]}>
      <BlockView data={getProps2} comp={Name} ref={ref} />
      {/* <BlockView data={getProps2} comp={Name2} ref={ref} label='gogogo' /> */}
      <BlockView<Data, { a: 1 }> data={() => ({ abb: 1 })} comp={AsyncBlockPure} enableStatus outProps={{ label: true, a: 's' }} a={'s'} />
      {/* <SignalView input={getProps2} format={Name} /> */}
      {/* <BlockView<Data> data={getProps} comp={AsyncBlockPure} enableStatus label="xx" /> */}
      {/* {$(getProps, AsyncBlockPure, true)} */}
      <br />
      {/* {$((props: any) => {
        console.log(props);
        const newProps = { ...props, ...getProps() };
        console.log(newProps);
        return <AsyncBlockPure {...newProps} />;
      }, true)} */}
      {/* {$(<AsyncBlockPure {...getProps()} />)} */}
      {/* <br />
      <AsyncBlock />
      <RuiKun />
      <RuiKun2 />
      <RuiKun3 />
      <RuiKun4 />
      <h1>
        see {$(sharedState.b.b1.b2)}
      </h1> */}
      <UserBlock ref={ref} />
      <BlockView data={getData2} comp={User2} enableStatus />
      <button onClick={changeFirstName}>changeFirstName</button>
    </Entry>
  );
};

export default Demo;
