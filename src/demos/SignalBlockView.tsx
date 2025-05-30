import { $, share, atom, deriveDict, derive, block, useAtom, getBlockParams, BlockView, BlockV2, SignalView } from 'helux';
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
  const { first, last, name } = props;
  console.log('ref', b);
  console.log(props);
  React.useEffect(() => {
    console.log('first render');
  }, []);

  return <div>{`>> result:${first} ${last}`} name {name}</div>;
});


const Name2 = (props: any, b: any) => {
  const { first, last, name } = props;
  console.log('ref', b);
  console.log(props);
  React.useEffect(() => {
    console.log('first render');
  }, []);
  React.useImperativeHandle(b, () => ({
    hello() {
      console.log('hello22' + props.mark);
    }
  }))

  return <div>{`>> result:${first} ${last}`} name {name}</div>;
};

const NameBlock = block((props) => {
  const { status } = getBlockParams(props);
  const { first, last } = sharedState.info.name;
  const nameSuffix = nameFistSuffix2.val;

  if (status.loading) return 'NameBlock loading...';

  return (
    <div>
      <h4>first: {first}</h4>
      <h4>last: {last}</h4>
      <h4>nameSuffix: {nameSuffix}</h4>
    </div>
  );
});

const getProps2 = () => {
  const { first, last } = sharedState.info.name;
  return { first, last, go: 1 };
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

const btn = <button onClick={() => setState(draft => void (draft.info.name.first = `${Date.now()}`))}>change sharedState.info.name.first</button>;

const Demo = () => {
  const ref = React.useRef<any>(null);
  const [name, setName] = React.useState('BlockView22');
  const [other, setOther] = React.useState('other');
  const list = useStatusList();
  console.log('loading', list[0].loading);

  const status = ac.useLoading().changeB12Sync;
  if (status.loading) return <span>is loading...</span>;

  // @ts-ignore
  // const badCase = <SignalView input={sharedState.info.name.first} />;
  return (
    <Entry fns={[changeB2, changeA, changeAtom, changeName, changeB12Sync, ac.actions.changeB12Sync, ac.actions.changeB12Sync_2]}>
      {/* {$(sharedState.info.name, val => `first val ${val.first}, last is ${val.last}`)}<br /> */}

      {/* {$(NameBlock)} */}

      <BlockView data={getProps2} comp={Name2} ref={ref} name={name} mark="BlockView" />
      {/* <BlockV2 data={getProps2} comp={Name2} ref={ref} viewProps={{ name, mark: 'BlockV2' }} /> */}

      {/* <BlockView comp={Name} ref={ref} /> */}
      {/* <SignalView input={getProps2} format={Name} ref={ref} /> */}

      {/* {$(sharedState.info.name.first)}<br /> */}

      {/* {badCase}<br /> */}

      {/* <SignalView input={() => sharedState.info.name.first} format={val => `first val -> ${val}`} /><br /> */}

      {/* <SignalView input={() => sharedState.info.name} format={val => `first val ${val.first}, last is ${val.last}`} /><br /> */}

      {/* <SignalView input={() => sharedState.info.name} format={Label} /><br /> */}

      {/* <BlockView<{ a: 1 }, { b: 1 }> data={() => sharedState.info.name} comp={Label} /><br /> */}
      {/* <BlockView<{ a: 1 }, { b: 1 }> data={() => ({ a: 1 })} comp={Label} outProps={{ b: 's' }} /><br /> */}

      {/* <BlockView data={getProps2} comp={Label} outProps={{ b: 's' }} /><br /> */}

      {/* {$(sharedState.info.name.first)}<br /> */}

      {/* {$(sharedState.info.name, (val) => `first val ${val.first}, last is ${val.last}`)} */}

      {/* <SignalView input={() => `-first val ${sharedState.info.name.first}, -last is ${sharedState.info.name.last}`} /><br /> */}

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

