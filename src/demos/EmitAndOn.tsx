import { $, share, emit, useOnEvent, on } from 'helux';
import React from 'react';
import { MarkUpdate, Entry } from './comps';

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
  });
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
