import { FROM } from '../../consts';
import type { IReactiveMeta } from '../../types/inner';
import { newMutateCtx } from '../common/util';

export const fakeDraftRoot = { val: null, isFake: true };

export const fakeMutateCtx = newMutateCtx({});

export const fakeReativeMeta: IReactiveMeta = {
  key: '', sharedKey: 0, moduleName: '', fnDepKeys: [], desc: '', onRead: undefined, from: FROM.SET_STATE, isFromCb: false,
};
