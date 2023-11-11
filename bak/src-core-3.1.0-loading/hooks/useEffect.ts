import { react } from '../react';
import type { EffectCb } from '../types';

let insKey = 0;
const MOUNT_MAP = new Map<number, { count: number }>();
let firstMountKey = 0;

function setFirstMountKey(insKey: number) {
  if (!firstMountKey) { // 未设置过才能设置
    firstMountKey = insKey;
  }
}

function isStrict() {
  return firstMountKey % 2 === 0;
}

function getInsKey() {
  insKey++;
  return insKey;
}

function markKeyMount(insKey: number) {
  const data = MOUNT_MAP.get(insKey);
  if (!data) {
    MOUNT_MAP.set(insKey, { count: 1 });
  } else {
    data.count += 1;
  }
}

function getKeyMount(insKey: number) {
  return MOUNT_MAP.get(insKey);
}

function mayExecuteCb(insKey: number, cb: EffectCb) {
  const effectLogic = () => {
    const cleanUp = cb();
    return () => {
      MOUNT_MAP.delete(insKey);
      cleanUp && cleanUp();
    };
  };

  setFirstMountKey(insKey);
  markKeyMount(insKey);
  if (isStrict()) {
    const curKeyMount = getKeyMount(insKey);
    // strict mode
    if (curKeyMount && curKeyMount.count > 1) {
      // trigger effect cb at second mount timing
      return effectLogic();
    }
  } else {
    return effectLogic();
  }
}

export function useEffectLogic(cb: EffectCb, options: { isLayout?: boolean, deps?: any[] }) {
  const { isLayout, deps } = options;
  const [insKey] = react.useState(() => getInsKey());
  const useFn = isLayout ? react.useLayoutEffect : react.useEffect;
  useFn(() => {
    return mayExecuteCb(insKey, cb);
  }, deps);
}

export function useLayoutEffect(cb: EffectCb, deps?: any[]) {
  useEffectLogic(cb, { isLayout: true, deps });
}

/**
 * only works for root StrictMode currently
 */
export function useEffect(cb: EffectCb, deps?: any[]) {
  useEffectLogic(cb, { deps });
}
