import type { ScopeType } from '../../types';
import { getSafeNext, isMax } from '../../utils';
import { getFnScope, getBlockScope, getInsScope } from './speedup';
import { getRootCtx } from '../root';
import { MUTATE_AUTO_DESC_PREFIX, SCOPE_TYPE } from '../../consts';

const fnKeyPrefix = {
  mutate: MUTATE_AUTO_DESC_PREFIX,
  [SCOPE_TYPE.STATIC]: 's',
  [SCOPE_TYPE.HOOK]: 'h',
};

export function genInsKey() {
  const insScope = getInsScope();
  const nextKey = getSafeNext(insScope.keySeed);
  insScope.keySeed = nextKey;
  return nextKey;
}

export function genBlockKey() {
  const blockScope = getBlockScope();
  const { keySeed, keyPrefix } = blockScope;
  const nextKey = getSafeNext(keySeed);
  blockScope.keySeed = nextKey;

  let prefix = keyPrefix;
  if (isMax(keySeed)) {
    prefix = getSafeNext(keyPrefix);
    blockScope.keyPrefix = prefix;
  }
  return `${prefix}_${nextKey}`;
}

export function genRenderSN() {
  const ctx = getRootCtx();
  const renderSN = ctx.renderSN;
  const nextNo = renderSN === Number.MAX_VALUE ? 1 : renderSN + 1;
  ctx.renderSN = nextNo;
  return nextNo;
}

export function genFnKey(keyType: ScopeType | 'mutate') {
  const fnScope = getFnScope();
  const keyMap = fnScope.keySeed;
  const keySeed = getSafeNext(keyMap[keyType]);
  keyMap[keyType] = keySeed;
  const prefix = fnKeyPrefix[keyType];
  return `${prefix}${keySeed}`;
}
