### type utils

```ts
/** share 返回的共享对象， draftRoot 和 draft 相等，atom 返回的共享对象， draftRoot = { val: draft } */
export type DraftRootType<T = SharedState> = T extends Atom | ReadOnlyAtom ? AtomDraft<T> : T;

/** share 返回的共享对象， draftRoot 和 draft 相等，atom 返回的共享对象， draftRoot = { val: draft } */
export type DraftType<T = SharedState> = T extends Atom | ReadOnlyAtom ? AtomDraftVal<T> : T;

export type StateRootType<T = SharedState> = T extends Atom | ReadOnlyAtom ? ReadOnlyAtom<T> : ReadOnlyDict<T>;

export type StateType<T = SharedState> = T extends Atom | ReadOnlyAtom ? ReadOnlyAtomVal<T> : ReadOnlyDict<T>;

/** partial state or cb */
export type PartialArgType<T> = T extends PlainObject ? Partial<T> | ((draft: T) => void | Partial<T>) : T | ((draft: T) => void | T);
```

## to del

```ts
AtomSyncFnBuilder;
AtomSyncer;
```

##

```ts
// 这个写法失败，调用时推导不出payload
  defineActions: <
    P = any,
    D = P extends Dict ? { [K in keyof P]: ActionFnDef<P[K], T> } : { [K in keyof D]: ActionFnDef<2, T> },
  >(actionsDef: D, throwErr?:boolean) => {
    actions: {
      [K in keyof D]: (
        payload: any,
        throwErr?: boolean,
      ) => ReturnType<D[K]> extends Promise<any> ? Promise<[NextState<T>, Error | null]> : [NextState<T>, Error | null];
    };
    getLoading: () => Ext<LoadingState<P>>;
    useLoading: () => [Ext<LoadingState<P>>, SetState<LoadingState>, IInsRenderInfo];
  };
```
