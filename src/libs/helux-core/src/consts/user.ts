import { VER as limuVer } from 'limu';

export const VER = '3.5.4';

export const LIMU_VER = limuVer;

/** 可按需注册更多的事件名并实现，方便插件收集更多的运行时数据做对应分析 */
export const EVENT_NAME = {
  ON_DATA_CHANGED: 'ON_DATA_CHANGED',
  ON_SHARE_CREATED: 'ON_SHARE_CREATED',
  ON_ERROR_OCCURED: 'ON_ERROR_OCCURED',
} as const;

export const RECORD_LOADING = {
  NO: 'no',
  PRIVATE: 'private',
  GLOBAL: 'global',
} as const;

export const FROM = {
  /**
   * 来自 top setState(draft)、ins setState(draft) 的读写
   * ```ts
   * const [, setState] = atom({a:1});
   * 
   * const [, setState] = useAtom();
   * ```
   */
  SET_STATE: 'SetState',
  /**
   * 来自 mutate task setState(draft), mutate fn draft 的读写
   * ```ts
   * mutate({
   *   fn: draft => draft.xx = 1,
   *   task: async({ setState }){ },
   * });
   * ```
   */
  MUTATE: 'Mutate',
  /**
   * 来自 action setState(draft) 的读写
   * ```ts
   * action(({ setState })=>{
   *   setState();
   * })
   * ```
   */
  ACTION: 'Action',
  /**
   * 来自 top reactive、ins reactive、mutate task draft、action draft 的读写
   * ```ts
   * const [,,{ reactive }] = atom({a:1});
   * 
   * const [ reactive ] = useReactive(someAtom);
   * 
   * mutate({
   *   task: async({ draft }){ },
   * });
   * 
   * action(async ({ draft })=>{ });
   * ```
   */
  REACTIVE: 'Reactive',
  /**
   * 来自伴生 loading 的读写
   */
  LOADING: 'Loading',
  /**
   * 来自 sync 的读写
   * ```ts
   * import { sync } from 'helux';
   * sync(someState)(to=>to.a.b);
   * 
   * const [,,{ sync }] = atom({a:1});
   * sync(to=>to.a.b);
   * ```
   */
  SYNC: 'Sync',
} as const;
