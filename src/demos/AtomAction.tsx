import React from "react";
import {
  atom,
  useAtom,
  atomAction,
  atomActionAsync,
} from "helux";
import { MarkUpdate, Entry } from './comps';
import { random, delay } from './logic/util';

const [numAtom, , ctx] = atom(1, { moduleName: 'AtomAction' });

const someAction = ctx.action(({ draftRoot, args }) => {
  draftRoot.val = (args[0] && Number.isInteger(args[0])) ? args[0] : random();
}, 'someAction');

const someAsyncAction = ctx.actionAsync<[number]>(async ({ setState, args }) => {
  await delay(2000);
  const val = (args[0] && Number.isInteger(args[0])) ? args[0] : random();
  // setState((_, draftRoot) => draftRoot.val = val);
  setState(val);
}, 'someAsyncAction');
setTimeout(() => {
  someAsyncAction(6000);
}, 6000)

// someAction()
// createAction3(numAtom, fnDef, desc)
// createAction3(numAtom)(fnDef, desc) --> actionFn
// createAction3(numAtom)<[...]>(fnDef, desc) --> actionFn

const normalAction = atomAction(numAtom)<[number, string]>(
  ({ setState, args }) => {
    const val = (args[0] && Number.isInteger(args[0])) ? args[0] : random();
    return val;
  },
  'normalAction'
);

const asyncAction = atomActionAsync(numAtom)<[number, string]>(
  async ({ setState, args }) => {
    await delay(2000);
    const val = (args[0] && Number.isInteger(args[0])) ? args[0] : random();
    setState(val);
  }, 'asyncAction'
);

function NumAtom() {
  const [num, setNum, info] = useAtom(numAtom);
  const changeNum = () => setNum(num + 1);
  const changeNumByDraft = () => setNum((val) => (val + 2));

  return (
    <MarkUpdate info={info}>
      <pre>num: {num}</pre>
      <button onClick={changeNum}>changeNum</button>
      <button onClick={changeNumByDraft}>changeNumByDraft</button>
    </MarkUpdate>
  );
}

function NumAtomLoading() {
  const [loading, , info2] = ctx.useActionLoading();
  const [num, , info] = useAtom(numAtom);
  const status = loading['asyncAction'];

  return (
    <MarkUpdate name="NumAtomLoading" info={[info, info2]}>
      <pre> {status.loading ? <h1>loading ...</h1> : <>num: {num}</>}</pre>
    </MarkUpdate>
  );
}

function Demo(props: any) {
  return (
    <Entry fns={[someAction, someAsyncAction, normalAction, asyncAction]}>
      <NumAtomLoading />
      <NumAtom />
    </Entry>
  );
}

export default Demo;

// // createAtomAsyncAction
// export function createAction2<T = any>(atom: Atom<T>): <A extends any[] = any[]>(fn: AtomAsyncActionFnDef<A, T>, desc?: string) => AtomAsyncActionFn<A, T>;

// // createAtomAction
// export function createAction3<T = any>(atom: Atom<T>): <A extends any[] = any[]>(fn: AtomActionFnDef<A, T>, desc?: string) => AtomActionFn<A, T>;