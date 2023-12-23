import { newMutateCtx, newReactiveMeta, newMutateFnItem, newFnCtx } from './ctor';
import { buildInternal } from '../creator/buildInternal';

export const fakeDraftRoot = { val: null, isFake: true };

export const fakeMutateCtx = newMutateCtx({});

export const fakeReativeMeta = newReactiveMeta();

// { [MUTATE_FN_ITEM]: 1, fn: fnItem, deps: noopArr, oriDesc: desc, desc, depKeys: [] }
export const fakeMutateFnItem = newMutateFnItem();

export const fakeInternal = buildInternal({ rawState: {}, forAtom: false, usefulName: '' } as any, {} as any);

export const fakeFnCtx = newFnCtx();
