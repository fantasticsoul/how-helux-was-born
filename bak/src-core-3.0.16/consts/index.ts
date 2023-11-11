import { createSymbol, HAS_SYMBOL } from '../helpers/sym';

export const VER = '3.0.16';

export { HAS_SYMBOL };

export const PROTO_KEY = '__proto__';

export const FN_KEY = createSymbol('HeluxFnKey');

/** see if the target is returned by block series api */
export const IS_BLOCK = createSymbol('HeluxIsBlock');

/** see if the target is returned by atom api */
export const IS_ATOM = createSymbol('HeluxIsAtom');

/** see if the target is returned by deriveAtom api */
export const IS_DERIVED_ATOM = createSymbol('HeluxIsDerivedAtom');

/**
 * mark fn a single change fn
 * why not use symbol, for stay away from console.log(`see desc ${symbol}`) err
 */
export const SINGLE_CHANGE = 'HeluxSingleChange';

/** 卸载数据的过期时间（单位：ms） */
export const EXPIRE_MS = 2000;

export const SIZE_LIMIT = 20;

export const RENDER_START = '1';

export const RENDER_END = '2';

export const NOT_MOUNT = 1;

export const MOUNTED = 2;

export const UNMOUNT = 3;

export const KEY_SPLITER = '|';

export const ASYNC_TYPE = {
  SOURCE: 'source',
  TASK: 'task',
  MAY_TRANSFER: 'may_transfer',
} as const;

export const SCOPE_TYPE = {
  STATIC: 'static',
  HOOK: 'hook',
} as const;

export const WAY = {
  FIRST_RENDER: 'FIRST_RENDER',
  EVERY_RENDER: 'EVERY_RENDER',
} as const;

// fn type
export const DERIVE = 'derive';
export const WATCH = 'watch';
