import { canUseDeep, isSymbol, prefixValKey, warn } from '@helux/utils';
import { IOperateParams } from 'limu';
import { immut } from 'limu';
import { IS_ATOM, KEY_SPLITER, SHARED_KEY } from '../../consts';
import { recordBlockDepKey } from '../../helpers/blockDep';
import { recordFnDepKeys } from '../../helpers/fnDep';
import { createOb } from '../../helpers/obj';
import { mapSharedState } from '../../helpers/state';
import type { Dict } from '../../types/base';
import { recordLastest } from '../common/blockScope';
import { callOnRead, newOpParams, isDict } from '../common/util';
import type { ParsedOptions } from './parse';

function cannotSet() {
  warn('changing shared state is invalid');
  return true;
}

/** no options arg here */
export function handleSymKey(isRoot: boolean, forAtom: boolean, sharedKey: number, key: any, value: any) {
  if (key === IS_ATOM) {
    // 仅根节点才读取 isAtom 表示是否是 atom 对象，其他节点一律返回 false
    return isRoot ? forAtom : false;
  }
  if (key === SHARED_KEY) {
    return sharedKey;
  }
  return value;
}

export function handleOpSymKey(opParams: IOperateParams, forAtom: boolean, sharedKey: number) {
  opParams.replaceValue(handleSymKey(!opParams.parentType, forAtom, sharedKey, opParams.key, opParams.value));
}

/**
 * 创建全局使用的共享对象，可提供给 useAtom useDerived useWatch derived watch 函数使用
 */
export function buildSharedState(options: ParsedOptions) {
  let sharedRoot: any = {};
  const { rawState, sharedKey, deep, forAtom, onRead, isPrimitive } = options;
  const collectDep = (valKey: string, keyPath: string[], val: any) => {
    const depKey = prefixValKey(valKey, sharedKey);
    // using shared state in derived/watch callback
    recordFnDepKeys([depKey], { sharedKey });
    recordBlockDepKey([depKey]);
    recordLastest(sharedKey, val, sharedRoot, depKey, keyPath);
  };

  if (canUseDeep(deep)) {
    sharedRoot = immut(rawState, {
      onOperate: (params: IOperateParams) => {
        const { isBuiltInFnKey, key, parentType } = params;
        if (isSymbol(key)) {
          return handleOpSymKey(params, forAtom, sharedKey);
        }

        if (!isBuiltInFnKey) {
          const { fullKeyPath } = params;
          const rawVal = callOnRead(params, onRead);
          collectDep(fullKeyPath.join(KEY_SPLITER), fullKeyPath, rawVal);
        }
      }
    });
  } else {
    // TODO 这段逻辑迁移到 helux-mini
    const toShallowProxy = (obj: any, isRoot: boolean, parentKey?: string): any => createOb(obj, {
      set: cannotSet,
      get: (target: Dict, key: any) => {
        const val = target[key];
        if (isSymbol(key)) {
          return handleSymKey(isRoot, forAtom, sharedKey, key, val);
        }
        // 为 {} 字典的 atom.val 再包一层监听
        if (isRoot && isDict(val)) {
          return toShallowProxy(val, false, key);
        }
        const rawVal = callOnRead(newOpParams(key, val, false), onRead);
        const keyPath = isRoot ? [key] : [parentKey, key];
        collectDep(key, keyPath, rawVal);
        return rawVal;
      },
    });

    sharedRoot = toShallowProxy(rawState, true);
  }

  let sharedState = sharedRoot;
  if (forAtom) {
    sharedState = isPrimitive ? rawState.val : new Proxy(rawState, {
      set: cannotSet,
      get: (t: any, k: any) => {
        // TODO FIXME 修复 k 传递 val 的问题
        // 从 sharedRoot 去获取
        const v = sharedRoot.val[k];
        return v;
      },
    });
  }

  mapSharedState(sharedKey, sharedRoot);
  return { sharedRoot, sharedState };
}
