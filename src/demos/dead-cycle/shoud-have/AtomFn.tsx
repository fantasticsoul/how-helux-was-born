import React from 'react';
import { atom, sharex, useAtom, atomx, $ } from 'helux';
import type { IPlugin } from 'helux';
import { MarkUpdate, Entry } from '../../comps';
import { log, delay, random } from '../../logic/util';

const [doubleAtom, setDouble] = atom(2, {
  moduleName: 'doubleAtom',
  mutate: [
    {
      // TODO 加入死循环示例
      fn: (draft: any, params: any) => {
        // console.log('draftRoot ', draftRoot)
        // params.draftRoot.val = params.draftRoot.val + 200;
        return draft * 2;
      },
      desc: 'atom_xxx',
    },
  ],
  alertDeadCycleErr: false,
});
const changeDoubleAtom = () => {
  setDouble(prev => prev + 100);
};


function Demo(props: any) {
  const fns = [changeDoubleAtom];
  // const fns:any[] = [];
  return <Entry fns={fns}>
  </Entry>
}


export default Demo;
