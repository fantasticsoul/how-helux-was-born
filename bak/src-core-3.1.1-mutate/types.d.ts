import type { ForwardedRef, FunctionComponent, PropsWithChildren, ReactNode } from './types-react';

/**
 * 函数描述
 * ```text
 * creaaAction 或者 定义 mutateFn 等场景建议明确传递函数描述，方便接入 helux-plugin-redux-devtool 后
 * 可以明确追踪到每一个调用的具体出处，不加的话可能都为 setState 调用
 * ```
 */
export type FnDesc = string;

/**
 * 不使用 loading 模块，设置此项后，shared/atom 的异步 action 执行状态将不发送到 loading 模块
 */
export type LoadingNone = 'NONE';

/**
 * 使用 loading 模块，异步 action 执行状态只发送到自己的 loading 模块，降低函数 desc 命名冲突可能性
 */
export type LoadingPrivate = 'PRIVATE';

/**
 * 使用 global loading 模块，异步 action 执行状态会发送到全局 loading 模块，会少占用一些内存
 * 但需要注意其他共享状态的 异步action函数的 desc 命名方式，避免相互覆盖
 */
export type LoadingGlobal = 'GLOBAL';

export type LoadingMode = LoadingNone | LoadingPrivate | LoadingGlobal;

export interface IBlockCtx {
  key: string;
  /** key: sharedState, value: depKeys */
  map: Map<SharedState, string[]>;
  collected: boolean;
  mounted: boolean;
  time: number;
  renderAtomOnce: boolean;
}

export interface IBlockOptions<P = object> {
  /**
   * default: true
   * block()返回组件实是否包裹React.memo，默认包裹
   */
  memo?: boolean;
  /**
   * default: undefined
   * memo 的比较函数，默认走 react 内置的浅比较规则，如确定 lock 不传递任何 props，建议设置为 ()=>true
   */
  compare?: (prevProps: Readonly<PropsWithChildren<P>>, nextProps: Readonly<PropsWithChildren<P>>) => boolean;
}

export type BlockStatusProps<P = object> = { status: LoadingStatus } & P;

export type BlockStatusCb<P = object> = (props: BlockStatusProps<P>, ref?: ForwardedRef<any>) => ReactNode;

export type BlockCb<P = object> = (props: P, ref?: ForwardedRef<any>) => ReactNode;

export type BlockComponent<P = object> = FunctionComponent<P>;

export type BlockStatusComponent<P = object> = FunctionComponent<P>;

export type NumStr = number | string;

export type NumStrSymbol = number | string | symbol;

export type Dict<T = any> = Record<NumStrSymbol, T>;

export type PlainObject = Record<string, {}>;

export type DictN<T = any> = Record<number, T>;

export type DictS<T = any> = Record<string, T>;

export type Fn<T = any> = (...args: any[]) => T;

/** returned by share */
export type SharedDict<T = PlainObject> = T;

/** returned by derive */
export type DerivedDict<R = PlainObject> = R;

/** shared result derive fn definition  */
export type DeriveDictFn<R = PlainObject> = (params: IDeriveFnParams<R>) => R;

export type NextSharedDict<T = PlainObject> = T;

export type NextAtom<T = any> = { val: T };

export type MutableDraft<T = PlainObject> = T;

/** returned by atom */
export type Atom<T = any> = { val: T };

/** returned by deriveAtom */
export type DerivedAtom<R = any> = { val: R };

/** derive atom fn definition  */
export type DeriveAtomFn<R = any> = (params: IDeriveFnParams<R>) => R;

export type NextAtomVal<T> = T;

export type ReadonlyAtom<T = any> = { readonly val: T };

export type MutableAtomDraft<T = any> = { val: T };

export type Ext<T = Dict, V = any> = T & { [key: string]: V };

export type KeyBoolDict = Record<string, boolean>;

export type KeyIdsDict = Record<string, NumStrSymbol[]>;

export type KeyInsKeysDict = Record<NumStrSymbol, number[]>;

export type Draft<T = SharedState> = T;

export type AtomDraft<T = any> = { val: T };

export type SharedState = SharedDict | Atom;

/** can pass to signal fn */
export type SingalVal = Atom | DerivedAtom | NumStrSymbol | ReactNode | BlockComponent | BlockStatusComponent;

export type AtomValType<T> = T extends Atom<infer V> ? V : T;

/**
 * 'FIRST_RENDER': 仅组件首次渲染时收集依赖，
 * 'EVERY_RENDER': 组件每一轮渲染时都收集依赖
 */
export type DepCollectionWay = 'FIRST_RENDER' | 'EVERY_RENDER';

export type LoadingStatus = {
  loading: boolean,
  err: Error | null,
  /** ok=!loading && !err */
  ok: boolean
};

export type LoadingState<T = Dict> = {
  [key in keyof T]: LoadingStatus;
}

export type ActionFnParam<A = any[], T = SharedState> = { draft: Draft<T>, setState: SetState<T>, desc: string, args: A };

export type AsyncActionFnParam<A = any[], T = SharedState> = { setState: SetState<T>, desc: string, args: A };

export type ActionFnDef<A = any[], T = SharedState> = (param: ActionFnParam<A, T>) => Partial<T> | void;

export type Action<A extends any[] = any[], T = SharedState> = (...args: A) => NextSharedDict<T>;

export type AsyncActionFnDef<A = any[], T = SharedState> = (param: AsyncActionFnParam<A, T>) => void;

export type AsyncAction<A extends any[] = any[], T = SharedState> = (...args: A) => Promise<NextSharedDict<T>>;

// atom action series

export type AtomActionFnParam<A = any[], T = any> = { draft: AtomDraft<T>, setState: SetAtom<T>, desc: string, args: A };

export type AtomAsyncActionFnParam<A = any[], T = any> = { setState: SetAtom<T>, desc: string, args: A };

export type AtomActionFnDef<A = any[], T = any> = (param: AtomActionFnParam<A, T>) => Partial<T> | void;

export type AtomAction<A extends any[] = any[], T = any> = (...args: A) => NextAtom<T>;

export type AtomAsyncActionFnDef<A = any[], T = any> = (param: AtomAsyncActionFnParam<A, T>) => void;

export type AtomAsyncAction<A extends any[] = any[], T = any> = (...args: A) => Promise<NextAtom<T>>;

export type ReadOnlyArr = readonly any[];

export interface IMutateTaskParam<T = SharedDict, A = any[]> {
  /**
   * 函数描述
   */
  desc: string;
  setState: SetState<T>;
  input: A,
}

export interface IAtomMutateTaskParam<T = any, A = any[]> {
  desc: FnDesc;
  setState: SetAtom<T>;
  input: A,
}

/** 呼叫 mutate 的句柄，由顶层api mutate 和 atomMutate 返回，可直接无理由重运行 mutate 函数 */
export type MutateCall = () => void;

export type MutateWitness = { call: MutateCall, desc: string };

// for dict
export type MutateTask<T = SharedDict, A> = (param: IMutateTaskParam<T, A>) => Promise<void>;

/** 如定义了 task 函数，则 fn 在异步函数执行之前回执行一次，且只在首次执行一次，后续不会执行 */
export type MutateFn<T = SharedDict> = (draft: Draft<T>) => void;

export type MutateFnItem<T = SharedDict, A = any[]> = {
  /** 异步 mutate 的依赖项列表 */
  deps?: () => A,
  fn?: MutateFn<T>,
  task?: null | MutateTask<T, A>;
  desc?: FnDesc,
  /** default: false, task 是否立即执行 */
  immediate?: boolean;
};

export type MutateFnDict<T = SharedDict> = Dict<MutateFn<T> | MutateFnItem<T>>;

export type MutateFnList<T = SharedDict> = Array<MutateFn<T> | MutateFnItem<T>>;

// for atom
export type AtomMutateTask<T = any, A = any[]> = (param: IAtomMutateTaskParam<T, A>) => Promise<void>;

/** 如定义了 task 函数，则 atom fn 在异步函数执行之前回执行一次，且只在首次执行一次，后续不会执行 */
export type AtomMutateFn<T = any> = (draft: AtomDraft<T>) => void;

export type AtomMutateFnItem<T = any, A = any[]> = {
  /** 如定义了 task，fn 只会执行一次 */
  fn: AtomMutateFn<T>,
  /** 异步 atom mutate 的依赖项列表 */
  deps?: () => A,
  /** 异步计算任务 */
  task?: null | AtomMutateTask<T, A>,
  /** 调用 createMutate 不传递 desc 的话，内部会自动生成一个 */
  desc?: FnDesc,
  /** default: false, task 是否立即执行 */
  immediate?: boolean;
};

export type AtomMutateFnDict<T = any> = Dict<AtomMutateFn<T> | AtomMutateFnItem<T>>;

export type AtomMutateFnList<T = any> = Array<AtomMutateFn<T> | AtomMutateFnItem<T>>;

export type PartialStateCb<T = Dict> = (prev: T) => (Partial<T> | void);

export type ChangeDraftCb<T = Dict> = (mutableDraft: T) => (Partial<T> | void);

export interface IDeriveAsyncOptions<R = Dict, D = any[]> {
  fn: (params: IAsyncDeriveFnParams<R, D>) => R;
  deps?: () => D;
  task: (params: IAsyncDeriveFnParams<R, D>) => Promise<R>;
  immediate?: boolean;
}

export interface IDeriveAtomAsyncOptions<R = any, D = any[]> {
  fn: (params: IAsyncDeriveAtomFnParams<R, D>) => R;
  deps?: () => D;
  task: (params: IAsyncDeriveAtomFnParams<R, D>) => Promise<R>;
  immediate?: boolean;
}

export type SetState<T = Dict> = (
  partialStateOrRecipeCb: Partial<T> | ((mutable: MutableDraft<T>) => void | Partial<T>),
  options?: ISetStateOptions<T>,
) => NextSharedDict<T>;

/** dangerous asyn set state */
export type AsyncSetState<T = Dict> = (
  partialStateOrRecipeCb: Partial<T> | ((mutable: MutableDraft<T>) => void | Partial<T>),
  options?: ISetStateOptions<T>,
) => Promise<NextSharedDict<T>>;

export type SetAtom<T = any> = (
  newAtomOrRecipeCb: T | ((mutable: MutableAtomDraft<T>) => void | T),
  options?: ISetStateOptions<Atom<T>>,
) => NextAtomVal<T>;

export type InnerSetState<T = Dict> = (
  partialStateOrRecipeCb: Partial<T> | ((mutable: MutableDraft<T>) => void | Partial<T>),
  options?: IInnerSetStateOptions<T>,
) => NextSharedDict<T>;

export type Call<T = Dict> = <A extends any[] = any[]>(
  srvFn: (ctx: {
    args: A;
    state: Readonly<T>;
    draft: MutableDraft<T>;
    setState: SetState<T>;
  }) => Partial<T> | void,
  ...args: A
) => NextSharedDict<T>;

/**
 * 👿 呼叫异步函数修改 draft 是危险的行为，可能会造成数据脏覆盖的情况产生
 */
export type AsyncCall<T = Dict> = <A extends any[] = any[]>(
  srvFn: (ctx: {
    args: A;
    state: Readonly<T>;
    draft: MutableDraft<T>;
    setState: SetState<T>;
  }) => Promise<Partial<T> | void>,
  ...args: A
) => Promise<NextSharedDict<T>>;

export type AtomCall<T = any> = <A extends any[] = any[]>(
  srvFn: (ctx: {
    args: A;
    state: ReadonlyAtom<T>;
    draft: MutableAtomDraft<T>;
    setState: SetAtom<T>;
  }) => T | void,
  ...args: A
) => NextAtomVal<T>;

/**
 * 👿 呼叫异步函数修改 atom draft 是危险的行为，可能会造成数据脏覆盖的情况产生
 */
export type AtomAsyncCall<T = any> = <A extends any[] = any[]>(
  srvFn: (ctx: {
    args: A;
    state: ReadonlyAtom<T>;
    draft: MutableAtomDraft<T>;
    setState: SetAtom<T>;
  }) => Promise<T | void>,
  ...args: A
) => Promise<NextAtomVal<T>>;

export type SyncerFn = (mayEvent: any, ...args: any[]) => void;

export type PathRecorder<T = SharedState, V = any> = (target: T) => V;

// 此处用 V 约束 before 函数的返回类型
export type SyncFnBuilder<T = SharedState, V = any> = (
  pathOrRecorder: string[] | PathRecorder<T>,
  /** 在提交数据之前，还可以修改其他数据或自身数据的函数 */
  before?: (eventNewVal: V, draft: T) => void,
) => SyncerFn;

export type Syncer<T = Dict> = { [key in keyof T]: SyncerFn };

export type SafeLoading<T = SharedState, O extends ICreateOptions<T> = ICreateOptions<T>>
  = O['mutate'] extends MutateFnDict<T> ? Ext<LoadingState<O['mutate']>, LoadingStatus> : Ext<LoadingState, LoadingStatus>;

export type AtomSafeLoading<T = any, O extends IAtomCreateOptions<T> = IAtomCreateOptions<T>>
  = O['mutate'] extends AtomMutateFnDict<T> ? Ext<LoadingState<O['mutate']>, LoadingStatus> : Ext<LoadingState, LoadingStatus>;

export interface ISharedCtx<T = SharedState, O extends ICreateOptions<T> = ICreateOptions<T>> {
  call: Call<T>;
  asyncCall: AsyncCall<T>;
  action: <A extends any[] = any[]>(fn: ActionFnDef<A, T>, desc?: FnDesc) => Action<A, T>;
  asyncAction: <A extends any[] = any[]>(fn: AsyncActionFnDef<A, T>, desc?: FnDesc) => AsyncAction<A, T>;
  state: SharedDict<T>;
  setState: SetState<T>;
  sync: SyncFnBuilder<T>;
  syncer: Syncer<T>;
  useState: (IUseSharedOptions?: IUseSharedOptions<T>) => [T, SetState<T>, IRenderInfo];
  loading: SafeLoading<T, O>;
  useLoading: () => [SafeLoading<T, O>, SetState<LoadingState>, IRenderInfo];
}

export interface IAtomCtx<T = any, O extends IAtomCreateOptions<T> = IAtomCreateOptions<T>> {
  call: AtomCall<T>;
  asyncCall: AtomAsyncCall<T>;
  action: <A extends any[] = any[]>(fn: AtomActionFnDef<A, T>, desc?: FnDesc) => AtomAction<A, T>;
  asyncAction: <A extends any[] = any[]>(fn: AtomAsyncActionFnDef<A, T>, desc?: FnDesc) => AtomAsyncAction<A, T>;
  state: Atom<T>;
  setState: SetAtom<T>;
  sync: SyncFnBuilder<Atom<T>>;
  syncer: Syncer<Atom<T>>;
  useState: (IUseSharedOptions?: IUseAtomOptions<T>) => [T, SetAtom<T>, IRenderInfo];
  loading: AtomSafeLoading<T, O>;
  useLoading: () => [AtomSafeLoading<T, O>, SetState<LoadingState>, IRenderInfo];
}

interface IMutateFnParamsBase {
  /** 是由外部还是内部定义的 mutate 触发的 */
  from: 'outMutate' | 'innerMutate';
  desc?: FnDesc;
  sn?: number;
}

export interface IMutateFnParams<T = SharedState> extends IMutateFnParamsBase {
  draft: T;
}

export interface IAtomMutateFnParams<T = any> extends IMutateFnParamsBase {
  draft: Atom<T>;
}

export interface IDataRule<T = any> {
  /**
   * 当这些数据节点发生变化时和被读取时，对应的各种行为
   */
  when: (state: T) => any | void;
  /**
   * 变化时，需要触发重渲染的和共享状态绑定关系的 id 对应的组件（ id 可在调用 useShared 时可设定 ）
   */
  ids?: NumStrSymbol[];
  /**
   * 变化时，需要触发重渲染的全局 id 对应的组件（ id 可在调用 useShared 或 useGlobalId 时可设定 ）
   */
  globalIds?: NumStrSymbol[];
  /**
   * defatul: false，表示不停止收集依赖
   * 读取时，是否依赖收集值停留到当前这一层，对应数组来说，停留在当前key+index，对于对象来说，停留在当前key
   */
  stopDep?: boolean;
}

export interface ICreateOptionsBaseFull {
  /**
   * 模块名称，方便用户可以查看到语义化的状态树，不传递的话内部会以生成的自增序号 作为 key
   * 传递的话如果重复了，目前的策略仅仅是做个警告，helux 内部始终以生成的自增序号作为模块命名空间控制其他逻辑
   */
  moduleName: string;
  /**
   * default: true
   * when true, it means using deep dependency collection strategy in component, using mutable state to generate new state
   */
  deep: boolean;
  /**
   * default: true ，是否使用精确更新策略
   * ```
   * 为 true 时，表示使用精确更新策略，此时相信用户用稳定方式去修改状态，helux 内部会使用深度依赖收集到的最长路径（即更新凭据）
   * 去更新视图，有助于缩小更新视图范围，达到更精确通知视图更新的目的，开启此设置需谨慎，确保开启后按约定使用稳定方式去修改状态，
   * 否则会造成冗余更新，具体原因见下面代码解释
   * ```
   * ```ts
   * // 如下为稳定方式更新，在 exact 为 true 时，会查 a1|b、a2|b|c、a2|b|e 这些依赖对应的视图更新
   * // exact 为 false 时，会查 a1、a1|b、a2、a2|b、a2|b|c、a2|b|e 这些依赖对应的视图更新
   * // 所以只要用户按约定一定使用稳定方式去修改状态的话，通知范围会减少
   * setState(draft=>{
   *  draft.a1.b = 1;
   *  draft.a2.b.c = 2
   *  draft.a2.b.e = 3
   * });
   *
   * // 如下使用非稳定方式更新时，此时只会查 a2 去更新视图，则可能造成部分视图冗余更新
   * setState(draft=>{
   *  draft.a2 = { b: { ...draft.a2.b, c: 2, e: 3 } };
   * });
   * // 冗余更新的原因是，假如视图V1读的是 a2.b.f，它的依赖是 a2、a2|b、a2|b|f，
   * // 上面的更新语句其实只改了 a2.b.c  a2.b.e，但更新凭据是 a2，则也会通知V1更新
   * // 如果使用稳定更新方式，用最长路径去更新视图的话，更新路径是 a2|b|c  a2|b|e，则不同通知V1更新
   * ```
   */
  exact: boolean;
  /**
   * default: true
   * 是否自动生成伴生的loading对象，用于辅助查询 mutate 或者 action 异步函数的执行状态
   */
  enableLoading: boolean;
  /**
   * default: PRIVATE，表示生成伴生 loading 的方式，具体含义见 LoadingMode
   */
  loadingMode: LoadingMode;
  /**
   * default: 6
   * 依赖收集的深度，默认 6， 意味着对复杂对象至多收集到第六层 json path 作为依赖
   */
  stopDepth: number;
  /**
   * deufalt: true
   * 遇到数组结构时，是否停止收集依赖，true 表示停止，此时只会收集到带下标的 json path，
   * 如：a|b|c|list|0，针对数组结构，stopDepthOfArr 会是 stopDepth + 1，多的一层用于记录下标值
   */
  stopArrDep: boolean;
}

export interface ICreateOptionsFull<T = Dict> extends ICreateOptionsBaseFull {
  /**
   * 配置状态变更联动视图更新规则
   */
  rules: IDataRule<T>[];
  /**
   * 定义当前状态对其他状态有依赖的 mutate 函数集合或函数，它们将被自动执行，并收集到每个函数各自对应的上游数据依赖
   */
  mutate: MutateFn<T> | MutateFnDict<T> | MutateFnList<T>;
  /**
   * mutate 结束到提交状态之前的中间函数，如需要返回则建议返回一层json key path 的对象
   */
  before: (params: IMutateFnParams<T>) => void | Partial<T>;
}

export interface IAtomCreateOptionsFull<T = any> extends ICreateOptionsBaseFull {
  /**
   * 配置状态变更联动视图更新规则
   */
  rules: IDataRule<Atom<T>>[];
  /**
   * 定义当前状态对其他状态有依赖的 mutate 函数集合或函数，它们将被自动执行，并收集到每个函数各自对应的上游数据依赖
  */
  mutate: AtomMutateFn<T> | AtomMutateFnDict<T> | AtomMutateFnList<T>;
  /**
   * mutate 结束到提交状态之前的中间函数
   */
  before: (params: IAtomMutateFnParams<T>) => void;
}

export interface IInnerCreateOptions<T = SharedState> extends ICreateOptionsFull<SharedState> {
  forAtom: boolean;
  forGlobal: boolean;
  stateType: string;
  loc: string;
  mutateFns: Array<MutateFnItem<T>>;
}

export interface IUseSharedOptionsBase {
  /**
   * default: 'EVERY_RENDER'
   * 依赖收集方式，默认是每一轮渲染都去收集视图的最新依赖数据
   */
  way?: DepCollectionWay;
  /**
   * 视图的id，在 ICreateOptionsFull.rules 里配置更新的 ids 包含的值指的就是此处配置的id，
   * 此id属于传入的 sharedState ，即和共享状态绑定了对应关系，意味着组件使用不同的 sharedState，
   * 时传入了相同的id，是相互隔离的状态
   */
  id?: NumStrSymbol;
}

export interface IUseSharedOptions<T = Dict> extends IUseSharedOptionsBase {
  /**
   * 组件的静态依赖，，一旦设置后当前组件的依赖收集行为将关闭，请慎用此设置
   */
  staticDeps?: (readOnlyState: T) => any[] | void;
  /**
   * 除了收集到的依赖之外，补充的额外依赖项，如果设置 staticDeps 则此设置无效
   */
  extraDeps?: (readOnlyState: T) => any[] | void;
}

export interface IUseAtomOptions<T = any> extends IUseSharedOptionsBase {
  staticDeps?: (readOnlyState: Atom<T>) => any[] | void;
  extraDeps?: (readOnlyState: Atom<T>) => any[] | void;
}

export interface IInnerUseSharedOptions<T = Dict> extends IUseSharedOptions<T> {
  /**
   * 全局id，在 ICreateOptionsFull.rules 子项里配置 globalIds，
   * 此 id 需通过 useGlobalId 设定
   */
  globalId?: NumStrSymbol;
  forAtom?: boolean;
}

export interface ISetStateOptions<T = any> {
  /**
   * 除了 setState 方法里收集的状态变化依赖之外，额外追加的变化依赖，适用于没有某些状态值无改变也要触发视图渲染的场景
   */
  extraDeps?: (readOnlyState: T) => any[] | void;
  /**
   * 需要排除掉的依赖，因内部先执行 extraDeps 再执行 excludeDeps，故 excludeDeps 也能排除掉 extraDeps 追加的依赖
   */
  excludeDeps?: (readOnlyState: T) => any[] | void;
  /**
   * 会传递到插件，标识调用源
   */
  desc?: FnDesc;
  /**
   * 功能同 ICreateOptions.rules[].ids，触发带 id 的组件实例更新
   */
  ids?: NumStrSymbol[];
  /**
   * 功能同 ICreateOptions.rules[].globalIds，触发带 globalId 的组件实例更新
   */
  globalIds?: NumStrSymbol[];
}

export interface IInnerSetStateOptions<T = Dict> extends ISetStateOptions<T> {
  isAsync?: boolean;
  sn?: number;
}

export type ICreateOptions<T = Dict> = Partial<ICreateOptionsFull<T>>;

export type IAtomCreateOptions<T = any> = Partial<IAtomCreateOptionsFull<T>>;

export type TriggerReason = { sharedKey: number; moduleName: string; keyPath: string[] };

export type CleanUpCb = () => void;

export type EffectCb = () => void | CleanUpCb;

export interface IWatchFnParams {
  isFirstCall: boolean;
  sn?: number;
}

export type WatchDepFn = () => any[] | void;

export interface IWatchOptions {
  deps?: WatchDepFn;
  /**
   * default: true，
   * 默认值为 true 是为了首次允许收集到依赖，如依赖在dep函数设定了，且不需要立即执行，
   * 则可以人工设定 immediate 为 false
   */
  immediate?: boolean;
}

export type WatchOptionsType = WatchDepFn | IWatchOptions;

export interface IDeriveFnParams<R = Dict> {
  isFirstCall: boolean;
  prevResult: R | null;
  triggerReasons: TriggerReason[];
}

export interface IAsyncDeriveFnParams<R = Dict, I = any[]> extends IDeriveFnParams<R> {
  input: I;
}

export interface IDeriveAtomFnParams<R = any, D = any[]> {
  isFirstCall: boolean;
  prevResult: Atom<R> | null;
  triggerReasons: TriggerReason[];
}

export interface IAsyncDeriveAtomFnParams<R = any, I = any[]> extends IDeriveAtomFnParams<R> {
  input: I;
}

export interface IUnmountInfo {
  t: number;
  /** mount count, 第一次挂载或第二次挂载 */
  c: 1 | 2;
  /**
   * @deprecated
   * 前一个实例 id，已无意义，后续会移除
   */
  prev: number;
}

export type FnType = 'watch' | 'derive';

export type ScopeType = 'static' | 'hook';

export type AsyncType = 'source' | 'task' | 'may_transfer';

export type ReanderStatus = '1' | '2';

export type MountStatus = 1 | 2 | 3;

export interface IFnCtx {
  /**
   * 计算函数本体，即透传给 derive 的回调函数
   */
  fn: Fn;
  /**
   * 函数唯一标记 key
   */
  fnKey: string;
  /**
   *  deriveAsync/useDeriveAsync 传入的异步计算任务函数
   */
  task: Fn;
  /** 配合 task 存在的 deps 函数 */
  deps: () => any[];
  /**
   * default: true，是否是处于第一层的函数，使用了其他计算结果时就会表标记为 false
   */
  isFirstLevel: boolean;
  /**
   * 当前函数的计算状态
   */
  status: LoadingStatus;
  /** 当前函数对应的下游函数中还剩几个需要执行 */
  remainRunCount: number;
  /**
   * 是否展示异步计算函数的变化过程
   */
  showProcess: boolean;
  /** 是否是 atom 导出的结果 */
  forAtom: boolean;
  /**
   * 直接依赖此函数的下一层函数列表，如其他函数使用了此函数的返回结果（包括中转返回结果），则它们的 key 会被记录到这里
   */
  nextLevelFnKeys: string[];
  /** 此函数依赖的上一层函数列表，如此函数内部使用了其他函数的返回结果，则把其他函数的 key 会被记录到这里 */
  prevLevelFnKeys: string[];
  /** 未挂载 已挂载 已卸载 */
  mountStatus: MountStatus;
  /** 依赖的 depKey 集合 */
  depKeys: string[];
  /** 依赖的共享状态 key 集合 */
  depSharedKeys: number[];
  /**
   * 计算函数返回的原始结果，总是指向第一次计算返回的结果
   */
  result: PlainObject;
  /**
   * 提供给 hook 函数读取的代理结果
   */
  proxyResult: PlainObject;
  fnType: FnType;
  scopeType: ScopeType;
  /** work for hook derived fnCtx */
  updater: Fn;
  /** 为了更友好的支持热更新而加入的标记，标记当前 fnCtx 是否已过期 */
  isExpired: boolean;
  /**
   * 是否返回了上游的计算结算，方便为计算结果中转机制服务
   * work for derived result transfer mechanism
   */
  returnUpstreamResult: boolean;
  /** work for hook derived fnCtx */
  renderStatus: ReanderStatus;
  /** fn ctx created timestamp */
  createTime: number;
  /** work for hook derived fnCtx  */
  shouldReplaceResult: boolean;
  /**
   * 是否是异步的计算函数，满足任意一种情况都会标记为 true
   * 1 使用了异步计算结果、
   * 2 返回了异步计算结果、
   * 3 返回了 asyncTask，
   */
  isAsync: boolean;
  /** 是否是一个中转结果的异步函数，内部用的标记 */
  isAsyncTransfer: boolean;
  asyncType: AsyncType;
  subscribe: Fn;
  renderInfo: IRenderInfo;
  /** 记录一些需复用的中间生成的数据 */
  extra;
  setLoading: (loading: boolean, err?: any) => void;
}

export interface IRenderInfo {
  /** 渲染序号，多个实例拥有相同的此值表示属于同一批次被触发渲染 */
  sn: number;
  /**
   * 获取当前组件的依赖列表，通常需要再 useEffect 里调用能获取当前渲染收集的依赖，
   * 如在渲染过程中直接调用获取的是前一次渲染收集的依赖
   */
  getDeps: () => string[];
}

export interface IInsCtx<T = Dict> {
  /** 当前渲染完毕所依赖的 key 记录 */
  readMap: Dict;
  /** 上一次渲染完毕所依赖的 key 记录 */
  readMapPrev: Dict;
  /** StrictMode 下辅助 resetDepMap 函数能够正确重置 readMapPrev 值 */
  readMapStrict: null | Dict;
  /** 是否是深度依赖收集模式 */
  isDeep: boolean;
  /** 是否是第一次渲染 */
  isFirstRender: boolean;
  insKey: number;
  /** 记录一些需复用的中间生成的数据 */
  extra: Dict;
  internal: T;
  rawState: Dict;
  sharedState: Dict;
  proxyState: Dict;
  updater: Fn;
  /** 未挂载 已挂载 已卸载 */
  mountStatus: MountStatus;
  renderStatus: ReanderStatus;
  /** ins ctx created timestamp */
  createTime: number;
  /** adapt to react 18 useSyncExternalStore */
  subscribe: Fn;
  /** 实例读取数据对应的版本号 */
  ver: number;
  id: NumStrSymbol;
  /** 全局id，此属性只服务于 useGlobaId 设定的 globalId */
  globalId: NumStrSymbol;
  way: DepCollectionWay;
  /** 能否收集依赖 */
  canCollect: boolean;
  /** 是否有静态依赖 */
  hasStaticDeps: boolean;
  renderInfo: IRenderInfo;
  recordDep: (valOrDepKey: string, isDepKey?: boolean) => void;
}

export type InsCtxMap = Map<number, IInsCtx>;

export interface ICreateDeriveLogicOptions {
  showProcess?: boolean;
  scopeType?: ScopeType;
  fnCtxBase?: IFnCtx;
  isAsyncTransfer?: boolean;
  runAsync?: boolean;
  asyncType?: AsyncType;
  returnUpstreamResult?: boolean;
  forAtom?: boolean;
  immediate?: boolean;
}

export interface IRuleConf {
  idsDict: KeyIdsDict;
  globalIdsDict: KeyIdsDict;
  stopDepInfo: {
    keys: string[];
    isArrDict: KeyBoolDict;
  };
}

interface ICallMutateFnOptions<T = SharedState> {
  draft?: T;
  isOut?: boolean;
  fn?: MutateFn<T> | AtomMutateFn<T>;
  task?: MutateTask<T> | AtomMutateTask<T>;
  desc?: FnDesc;
  sn?: number;
  deps?: Fn;
}

export interface IUseDerivedAsyncOptions {
  /**
   * default: true
   * 是否展示计算过程，const [ result , status ] = useDerivedAsync()
   * 为 true 时，status.loading 是会变化并通知组件重渲染的
   */
  showProcess?: boolean;
}

export interface ICreateMutateFnsOptions<T = SharedState> {
  target: T;
  fns: Array<MutateFnItem<T> | AtomMutateFnItem<T>>;
}

export interface IRunMutateFnOptions<T = SharedState> extends ICreateMutateFnsOptions<T> {
  /** default: true，是否外部调用 */
  isOut?: boolean;
}

export interface IChangeInfoBase {
  sharedKey: number;
  moduleName: string;
}

export interface IDataChangingInfo extends IChangeInfoBase {
  draft: MutableDraft;
}

export interface IDataChangedInfo extends IChangeInfoBase {
  type: string;
  snap: SharedState;
}

export interface IMiddlewareCtx extends IDataChangingInfo {
  setData(key: any, value: any);
  idx: number;
}

export type Middleware = (midCtx: IMiddlewareCtx) => void;

export type PluginStateChangedOnCb = (info: IDataChangedInfo) => void;

export type PluginStateChangedOn = (cb: PluginStateChangedOnCb) => void;

export type PluginCommonOnCb = (data: any) => void;

export type PluginCommonOn = (heluxEventName: string, cb: PluginCommonOnCb) => void;

export type PluginCtx = { on: PluginCommonOn; onStateChanged: PluginStateChangedOn };

/**
 * 内置一些高频使用的时间监听，如 onStateChanged
 */
export type PluginInstall = (pluginCtx: PluginCtx) => void;

export interface IPlugin {
  install: PluginInstall;
  name?: string;
  desc?: FnDesc;
}
