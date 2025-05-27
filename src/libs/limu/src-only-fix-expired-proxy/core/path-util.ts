import { isMap } from '../support/util';

function getKeyPathIdx(keyPaths: string[][], keyPath: string[]) {
  const keyPathStrs = keyPaths.map(v => v.join('|'));
  const keyPathStr = keyPath.join('|');
  return keyPathStrs.indexOf(keyPathStr);
}

export function pushKeyPath(keyPaths: string[][], keyPath: string[]) {
  const idx = getKeyPathIdx(keyPaths, keyPath);
  if (idx < 0) {
    keyPaths.push(keyPath);
  }
}

export function delKeyPath(keyPaths: string[][], keyPath: string[]) {
  const idx = getKeyPathIdx(keyPaths, keyPath);
  keyPaths.splice(idx, 1);
}

/**
 * string 获取不到，尝试转为 number 获取
 */
export function getMapVal(map: Map<any, any>, key: string) {
  const strKeyVal = map.get(key);
  if (strKeyVal !== undefined) {
    return strKeyVal;
  }
  const numKeyVal = map.get(Number(key) || key);
  if (numKeyVal !== undefined) {
    return numKeyVal;
  }
  return undefined;
}

export function getVal(obj: any, keyPath: string[]) {
  let val: any;
  let parent = obj;
  const lastIdx = keyPath.length - 1;
  let isGetted = true;

  for (let i = 0; i <= lastIdx; i++) {
    const key = keyPath[i];
    if (!parent && i < lastIdx) {
      isGetted = false;
      break;
    }
    val = isMap(parent) ? getMapVal(parent, key) : parent[key];
    parent = val;
  }

  return { val, isGetted };
}

export function getValByKeyPaths(obj: any, keyPaths: string[][]) {
  let targetVal: any
  let isValGetted = false;

  const lastIdx = keyPaths.length - 1;
  for (let i = 0; i <= lastIdx; i++) {
    const keyPath = keyPaths[i];
    const { isGetted, val } = getVal(obj, keyPath);
    if (isGetted) {
      targetVal = val;
      isValGetted = true;
      break;
    }
  }
  return { isGetted: isValGetted, val: targetVal };
}

export function setVal(obj: any, keyPath: string[], val: any) {
  let parent = obj;
  const lastIdx = keyPath.length - 1;
  for (let i = 0; i <= lastIdx; i++) {
    if (!parent) {
      break;
    }
    const key = keyPath[i];
    if (i === lastIdx) {
      parent[key] = val;
      break;
    }
    parent = isMap(parent) ? getMapVal(parent, key) : parent[key];
  }
}

export function setValByKeyPaths(obj: any, keyPaths: string[][], val: any) {
  const lastIdx = keyPaths.length - 1;
  for (let i = 0; i <= lastIdx; i++) {
    const keyPath = keyPaths[i];
    setVal(obj, keyPath, val);
  }
}
