import { react } from '../react';
import type { Dict, PartialStateCb } from '../types';
import { isFn } from '../utils';

export function useObjectLogic<T = Dict>(
  state: T,
  setState: (partialStateOrCb: any) => void,
  callInputSet?: boolean,
): [T, (partialStateOrCb: any) => void] {
  const ctxRef = react.useRef({ state, unmount: false });
  ctxRef.current.state = state;

  const stableSet = react.useCallback((partialStateOrCb: any) => {
    if (ctxRef.current.unmount) { // already unmounted
      return;
    }
    if (callInputSet) {
      return setState(partialStateOrCb); // take over by use cumtom setState
    }

    const state = ctxRef.current.state;
    const partial = (isFn(partialStateOrCb) ? partialStateOrCb(state) : partialStateOrCb) || {};
    setState({ ...state, ...partial });
  }, [ctxRef]); // no need pass callInputSet here

  react.useEffect(() => {
    ctxRef.current.unmount = false; // 防止 StrictMode 写为 true
    // cleanup callback，标记组件已卸载
    return () => {
      ctxRef.current.unmount = true;
    };
  }, []);
  return [state, stableSet];
}

/**
 * 使用 useObject 有两个好处
 * ```txt
 * 1 方便定义多个状态值时，少写很多 useState
 * 2 内部做了 unmount 判断，让异步函数也可以安全的调用 setState，避免 react 出现警告 :
 * "Called SetState() on an Unmounted Component" Errors
 * ```
 * @param initialState
 * @returns
 */
export function useObject<T = Dict>(
  initialState: T | (() => T),
): [T, (partialStateOrCb: Partial<T> | PartialStateCb<T>) => void] {
  const [state, setFullState] = react.useState<T>(initialState);
  return useObjectLogic(state, setFullState);
}
