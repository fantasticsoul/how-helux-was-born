import { noop } from '@helux/utils';
import { FROM } from '../../consts';
import type { IReactiveMeta } from '../../types/inner';
import type { MutateFnStdItem } from '../../types/base';
import { newMutateCtx } from '../common/util';

export const fakeDraftRoot = { val: null, isFake: true };

export const fakeMutateCtx = newMutateCtx({});

export const fakeReativeMeta: IReactiveMeta = {
  isReactive: false,
  key: '',
  sharedKey: 0,
  moduleName: '',
  fnDepKeys: [],
  desc: '',
  onRead: undefined,
  from: FROM.SET_STATE,
  isFromCb: false,
};

// { [MUTATE_FN_ITEM]: 1, fn: fnItem, deps: noopArr, oriDesc: desc, desc, depKeys: [] }
export const fakeMutateFnItem: MutateFnStdItem = {
  fn: noop,
  depKeys: [],
  oriDesc: '',
  desc: '',
}
