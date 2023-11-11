import { IOperateParams, immut } from 'limu';
import { KEY_SPLITER } from '../../consts';
import { createOb } from '../../helpers/obj';
import type { Dict, IRuleConf, ISetStateOptions, NumStrSymbol, TriggerReason } from '../../types';
import { isDebug, prefixValKey, canUseProxy, matchDictKey, matchListItem } from '../../utils';
import { DepKeyInfo } from '../../types-inner';

export interface IMutateCtx {
  depKeys: string[];
  triggerReasons: TriggerReason[];
  ids: NumStrSymbol[];
  globalIds: NumStrSymbol[];
  writeKeys: Dict;
  arrKeyDict: Dict;
  writeKeyPathInfo: Dict<TriggerReason>;
  /** TODO ：记录变化值的路径，用于异步执行环境合并到 rawState 时，仅合并变化的那一部分节点，避免数据脏写 */
  keyPathValue: Map<string[], any>;
}

// for hot reload of buildShared
export function tryGetLoc(moduleName: string, startCutIdx = 4) {
  let loc = '';
  if (isDebug() && moduleName) {
    try {
      throw new Error('loc');
    } catch (err: any) {
      loc = err.stack.split('\n').slice(startCutIdx, 8).join('|');
    }
  }
  return loc;
}

export function newMutateCtx(options: ISetStateOptions): IMutateCtx {
  const { ids = [], globalIds = [] } = options; // 用户 setState 可能设定了 ids globalIds
  return {
    depKeys: [],
    triggerReasons: [],
    ids,
    globalIds,
    writeKeys: {},
    arrKeyDict: {}, // 记录读取过程中遇到的数组key
    writeKeyPathInfo: {},
    keyPathValue: new Map(),
  };
}

export function newOpParams(key: string, value: any, isChange = true): IOperateParams {
  return { isChange, op: 'set', key, value, parentType: 'Object', keyPath: [], fullKeyPath: [key], isBuiltInFnKey: false };
}

export function getDepKeyInfo(depKey: string): DepKeyInfo {
  const [sharedKey, rest] = depKey.split('/');
  const keyPath = rest.split(KEY_SPLITER);
  return { sharedKey: Number(sharedKey), keyPath, depKey };
}

export function getDepKeyByPath(fullKeyPath: string[], sharedKey: number) {
  return prefixValKey(fullKeyPath.join(KEY_SPLITER), sharedKey);
}

export function createImmut(obj: Dict, onOperate: (op: IOperateParams) => void) {
  if (canUseProxy()) {
    return immut(obj, { onOperate })
  }

  return createOb(obj, {
    get(target, key) {
      const val = target[key];
      const op = newOpParams(key, val, false);
      onOperate(op);
      return val;
    }
  })
}
