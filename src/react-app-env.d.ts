/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />

import * as heluxApi from './libs/helux-core/src/types/api';
import * as heluxModelApi from './libs/helux-core/src/types/model';
import * as base from './libs/helux-core/src/types/base';

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly PUBLIC_URL: string;
  }
}

declare global {
  interface Window {
    ori: any;
    [key: string]: any;
  }
}


declare module '*.avif' {
  const src: string;
  export default src;
}

declare module '*.bmp' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  import * as React from 'react';

  export const ReactComponent: React.FunctionComponent<React.SVGProps<
    SVGSVGElement
  > & { title?: string }>;

  const src: string;
  export default src;
}

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.sass' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module 'helux' {
  export const {
    atom,
    atomx,
    share,
    sharex,
    // derive api
    derive,
    deriveDict,
    defineDeriveTask,
    defineDeriveFnItem,
    runDerive,
    runDeriveTask,
    // watch api
    watch,
    watchEffect,
    // hooks api
    useAtom,
    useAtomX,
    useReactive,
    useReactiveX,
    useDerived,
    useWatch,
    useGlobalId,
    useService,
    useOnEvent,
    useMutable,
    useMutateLoading,
    useActionLoading,
    useEffect,
    useLayoutEffect,
    useStable,
    useObject,
    useLocalForceUpdate,
    useGlobalForceUpdate,
    useLockDep,
    // for react class component
    bindAtom,
    withAtom,
    assignThisHX,
    getHX,
    makeWithAtomOptions,
    // action api
    action,
    // signal api
    signal,
    block,
    dynamicBlock,
    getBlockParams,
    $,
    SignalView,
    SignalV2,
    BlockView,
    BlockV2,
    // mutate api
    mutate,
    mutateDict,
    runMutate,
    runMutateTask,
    defineMutateFnItem,
    // sync api
    sync,
    syncer,
    // emit api
    emit,
    on,
    // init api
    init,
    // util api
    reactiveDesc,
    flush,
    isAtom,
    isDerivedAtom,
    storeSrv,
    shallowCompare,
    markRaw,
    isDiff,
    produce,
    getMutateLoading,
    getActionLoading,
    getDeriveLoading,
    getRawState,
    getSnap,
    getAtom,
    addMiddleware,
    addPlugin,
    cst,
  } = heluxApi;

  export const createShared = heluxApi.share;

  export const {
    // high level api
    model,
    modelFactory,
  } = heluxModelApi;
}
