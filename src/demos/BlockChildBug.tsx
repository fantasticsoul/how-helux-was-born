import { share, block, shallowCompare, getRawState } from "helux";
import React from "react";
import { Entry, MarkUpdate } from "./comps";

const [state, setState] = share({ a: 1, b: { b1: { num: 1 } } });

function changeChild() {
  setState(draft => void (draft.b.b1.num = Date.now()))
}

/**
 * 修改 b.b1.num 时
 * depKeys:  ['3/b|b1|num']
 * 查到 3 对应的函数的子串 ['3/a', '3/b'] 里 '3/b' 变了，故能更新 3 对应的组件 Father
 */

const Child: any = React.memo((props: any) => {
  console.log('Render Child start');
  const ui = <div>b.b1: {props.b.b1.num}</div>;
  console.log('Render Child end');
  return ui;
}, shallowCompare);

// fn deps ['3/a', '3/b']
// block deps ['3/a', '3/b']
const Father = block(() => {
  console.log('Render Father start');
  const ui = <div>{state.a} <Child b={state.b} /></div>;
  console.log('Render Father end');
  return ui;
});

const Demo = () => (
  <Entry fns={[changeChild]}>
    <Father />
    {/* <Desc /> */}
  </Entry>
);

export default Demo;
