import React from 'react';
import * as demos from '../demos';

const cbTypeMap: Record<string, string> = {
  'Symbol(react.forward_ref)': 'forwardRef',
  'Symbol(react.memo)': 'memo',
};

export const entryKeys = Object.keys(demos).filter(key => key !== 'INITIAL_KEY');
let initialKey = demos.INITIAL_KEY;
if (!entryKeys.includes(initialKey)) {
  initialKey = entryKeys[0];
}

export function getInitialKey(){
  return initialKey;
}

export const entrys: Stat[] = [];
export const mainKeys: string[] = [];
Object.keys(demos).forEach((v) => {
  // @ts-ignore
  const stat = getCompStat(v, demos[v]);
  stat && entrys.push(stat);
});

export const compDict: any = {};
export const keySubKeys: any = {};
entrys.forEach(v => {
  mainKeys.push(v.key);
  keySubKeys[v.key] = v.comps.map(v => v.key);
  v.comps.forEach(sub => compDict[`${v.key}/${sub.key}`] = sub.comp)
});

function isComp(comp: any) {
  const keys = Object.keys(comp);
  if (keys.length === 0) {
    return true;
  }

  const reactTypeOf = (comp['$$typeof'] || '').toString();
  return !!cbTypeMap[reactTypeOf];
}

export type Stat = { key: string, comps: { key: string, comp: any }[] };

export function getCompStat(key: string, mayComp: any) {
  if (typeof mayComp === 'string') {
    return null;
  }

  if (isComp(mayComp)) {
    return { key, comps: [{ key, comp: mayComp }] };
  }

  const item: Stat = { key, comps: [] };
  Object.keys(mayComp).forEach((key) => {
    item.comps.push({ key, comp: mayComp[key] });
  });

  return item;
}


export function renderView(mainKey: string, subKey: string) {
  const key = `${mainKey}/${subKey}`;
  // @ts-ignore
  const Comp = compDict[key];
  return <Comp />;
}

export function useAutoSwitchComp(viewKeyRef: any, setMainKey: any, setSubKey: any) {
  React.useEffect(() => {
    setInterval(() => {
      const [mainKey, subKey] = viewKeyRef.current;

      let subKeys = keySubKeys[mainKey];
      let mainKeyIdx = mainKeys.indexOf(mainKey);
      let subKeyIdx = subKeys.indexOf(subKey);
      let nextMainKey = mainKey;
      let nextSubKeyIdx = subKeyIdx + 1;
      let nextSubKey = subKeys[nextSubKeyIdx];

      if (nextSubKeyIdx > subKeys.length - 1) {
        nextSubKeyIdx = 0;
        mainKeyIdx = mainKeyIdx + 1;
        if (mainKeyIdx > mainKeys.length - 1) {
          mainKeyIdx = 0;
        }
        nextMainKey = mainKeys[mainKeyIdx];
        subKeys = keySubKeys[nextMainKey];
        nextSubKey = subKeys[nextSubKeyIdx];
      }

      viewKeyRef.current = [nextMainKey, nextSubKey];
      setMainKey(nextMainKey);
      setSubKey(nextSubKey);
      console.log(`change to ${nextMainKey}/${nextSubKey}`);
    }, 200);
  }, [viewKeyRef]);
}