import { noop } from '@helux/utils';
import type { CoreApiCtx } from '../types/api-ctx';
import type { Dict } from '../types/base';
import { checkSharedStrict } from '../factory/common/check';
import { updateIns } from '../factory/creator/notify';

/**
 * 慎用此功能，会造成使用了某个共享状态的所以实例被强制更新
 */
export function useAtomForceUpdate<T = any>(
  apiCtx: CoreApiCtx,
  sharedState: T,
) {
  noop(apiCtx);
  return () => {
    const internal = checkSharedStrict(sharedState);
    const { insCtxMap, key2InsKeys } = internal;
    const insKeyDict: Dict<number> = {};
    // 查找到绑定了依赖关系的各个实例，用字典去重
    Object.keys(key2InsKeys).forEach((depKey) => {
      const insKeys = key2InsKeys[depKey];
      insKeys.forEach(insKey => insKeyDict[insKey] = 1);
    });

    // sn 更新批次加一
    internal.sn += 1;
    const nextSn = internal.sn;
    // 开始遍历并更新所有实例
    Object.keys(insKeyDict).forEach((insKey) => {
      updateIns(insCtxMap, Number(insKey), nextSn);
    });
  };
}
