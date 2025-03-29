import { $, share, emit, useOnEvent, on } from 'helux';
import React from 'react';
import { MarkUpdate, Entry } from './comps';

import { atom, withAtom, assignThisHX } from 'helux';

const [numAtom] = atom({ num: 1, info: { addr: 'bj' } });
const [bookAtom] = atom({ name: 'book', list: [] });

class DemoCls extends React.Component {
  private hx = assignThisHX(this);
  addNum = () => {
    this.hx.num.setState((draft: any) => void (draft.num += 2));
  };
  render() {
    const { num: { state } } = this.hx;
    return <div>hello num {state.num}<button onClick={this.addNum}> add num </button></div>;
  }
}

const IDemo = withAtom(DemoCls, { atoms: { num: numAtom, book: bookAtom } });

const [sharedState, setState, ctx] = share({ a: 1, b: { b1: { b2: 200 } } }, { moduleName: 'DeriveTask' });

// const off = on('test_event', (...args) => {
//   console.log('receive args ', ...args);
// });
// setTimeout(() => {
//   console.log('off event', 'test_event');
//   off();
// }, 13000)

function emitEvent() {
  emit('test_event', 1, 2);
}

function Comp() {
  const [num, setNum] = React.useState(1);
  const change = () => setNum(prev => prev + 1);
  useOnEvent('test_event', (...args) => {
    console.log('receive args ', ...args);
    console.log('num is ', num);
  }, true);
  return (
    <MarkUpdate>
      shared.xxx {$(sharedState.a)}
      <button onClick={change}>change {num}</button>
    </MarkUpdate>
  );
}

const Demo = () => (
  <Entry fns={[emitEvent]}>
    <Comp />
  </Entry>
);

export default Demo;
