import type { InsCtxDef } from '../../factory/creator/buildInternal';
import type { IReactiveMeta } from '../../types/inner';
import { newMutateCtx } from '../common/util';

const fakeDraftRoot = { val: null, isFake: true };
const fakeMutateCtx = newMutateCtx({});
const fakeReativeMeta: IReactiveMeta = { key: '', sharedKey: 0, depKeys: [], desc: '', onRead: undefined, from: 'SetState' };
/** 正在执行中的 rootDrft */
let CURRENT_DRAFT_ROOT = fakeDraftRoot;
/** 正在执行中的 mutateCtx */
let CURRENT_MUTATE_CTX = fakeMutateCtx;

/**
 * let code below works
 * ```ts
 * const [shared] = useAtom(data);
 * useWatch(()=>{}, ()=>[shared]);
 * ```
 */
const CURRENT_INS_CTX = new Map<any, InsCtxDef>();

const CURRENT_REACTIVE_DESC = new Map<number, string>();

const CURRENT_REACTIVE_META = new Map<string, IReactiveMeta>();

export function setAtomVal(val: any) {
  CURRENT_DRAFT_ROOT.val = val;
}

export function currentDraftRoot() {
  return CURRENT_DRAFT_ROOT;
}

export const REACTIVE_DESC = {
  current: (key: number) => CURRENT_REACTIVE_DESC.get(key) || 'SetState',
  set: (key: number, desc: string) => CURRENT_REACTIVE_DESC.set(key, desc),
  del: (key: number) => CURRENT_REACTIVE_DESC.delete(key),
};

let CURRENT_REACTIVE_KEY = '';

/** 记录、获取正在执行写操作的 draft 对象元数据 */
export const REACTIVE_META = {
  current: () => CURRENT_REACTIVE_META.get(CURRENT_REACTIVE_KEY) || fakeReativeMeta,
  markUsing: (key: string) => CURRENT_REACTIVE_KEY = key,
  set: (key: string, obj: IReactiveMeta) => CURRENT_REACTIVE_META.set(key, obj),
  del: (key: string) => CURRENT_REACTIVE_META.delete(key),
};

export const INS_CTX = {
  current: (rootVal: any) => CURRENT_INS_CTX.get(rootVal),
  set: (rootVal: any, insCtx: InsCtxDef) => CURRENT_INS_CTX.set(rootVal, insCtx),
  del: (rootVal: any) => CURRENT_INS_CTX.delete(rootVal),
};

export const DRAFT_ROOT = {
  /** may use ' get current(){}...' in the future */
  current: () => CURRENT_DRAFT_ROOT,
  set: (draftRoot: any) => (CURRENT_DRAFT_ROOT = draftRoot),
  del: () => (CURRENT_DRAFT_ROOT = fakeDraftRoot),
};

export const MUTATE_CTX = {
  /** may use ' get current(){}...' in the future */
  current: () => CURRENT_MUTATE_CTX,
  set: (mctx: any) => (CURRENT_MUTATE_CTX = mctx),
  del: () => (CURRENT_MUTATE_CTX = fakeMutateCtx),
};
