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
    // derive for shared state
    derive,
    // derive for shared atom
    deriveDict,
    watch,
    runDerive,
    useAtom,
    useReactive,
    useGlobalForceUpdate,
    // use derived state
    useDerived,
    useWatch,
    useGlobalId,
    useObject,
    useService,
    useLocalForceUpdate,
    useEffect,
    useLayoutEffect,
    useOnEvent,
    useMutable,
    useMutateLoading,
    useActionLoading,
    useStable,
    // create action api
    storeSrv,
    action,
    sync,
    syncer,
    // signal api
    signal,
    block,
    dynamicBlock,
    $,
    // emit api
    reactiveDesc,
    flush,
    emit,
    on,
    produce,
    currentDraftRoot,
    setAtomVal,
    shallowCompare,
    isDiff,
    getMutateLoading,
    getActionLoading,
    getDeriveLoading,
    getRawState,
    getSnap,
    getAtom,
    runMutate,
    runMutateTask,
    mutate,
    mutateDict,
    addMiddleware,
    addPlugin,
    EVENT_NAME,
    RECORD_LOADING,
    VER,
    LIMU_VER,
  } = heluxApi;

  export const createShared = heluxApi.share;

  export const {
    // high level api
    model,
    modelFactory,
  } = heluxModelApi;
}
