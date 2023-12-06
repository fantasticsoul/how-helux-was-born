/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />

import * as heluxApi from './libs/helux-core/src/types/api';
import * as heluxModelApi from './libs/helux-core/src/types/model';


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
    share,
    shareState,
    shareAtom,
    // derive for shared state
    derive,
    // derive for shared atom
    deriveAtom,
    watch,
    runDerive,
    runDeriveAsync,
    createShared,
    useAtom,
    useShared,
    // use derived state
    useDerived,
    // use derived atom
    useDerivedAtom,
    useWatch,
    useGlobalId,
    useObject,
    useService,
    useForceUpdate,
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
    actionAsync,
    atomAction,
    atomActionAsync,
    sync,
    syncer,
    // signal api
    signal,
    block,
    dynamicBlock,
    $,
    // emit api
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
    atomMutate,
    addMiddleware,
    addPlugin,
    EVENT_NAME,
    RECORD_LOADING,
    VER,
    LIMU_VER,
    limu,
  } = heluxApi;

  export const {
    // high level api
    model,
    modelFactory,
  } = heluxModelApi;
}
