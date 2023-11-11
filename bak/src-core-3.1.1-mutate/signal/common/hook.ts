import { isDerivedAtom } from '../../factory/common/atom';
import { delBlockCtx, markBlockMounted } from '../../helpers/blockCtx';
import { isSharedState } from '../../helpers/state';
import { useDerivedSimpleLogic } from '../../hooks/common/useDerivedLogic';
import { useSharedSimpleLogic } from '../../hooks/common/useSharedLogic';
import { react } from '../../react';
import type { IBlockCtx, LoadingStatus } from '../../types';

export function useDep(blockCtx: IBlockCtx, showProcess = false) {
  let status: LoadingStatus = { loading: false, err: null, ok: true };
  blockCtx.map.forEach((depKeys, stateOrResult) => {
    // trust beblow statement, cause map length is stable
    if (isSharedState(stateOrResult)) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const insCtx = useSharedSimpleLogic(stateOrResult);
      if (insCtx.isFirstRender) {
        // transfer depKeys
        depKeys.forEach((depKey) => insCtx.recordDep(depKey, true));
      }
      insCtx.isFirstRender = false;
    } else {
      // will transfer depKeys in genDerivedResult process
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const fnCtx = useDerivedSimpleLogic({ fn: stateOrResult, forAtom: isDerivedAtom(stateOrResult), showProcess });
      if (!fnCtx.status.ok) {
        status = fnCtx.status;
      }
    }
  });
  return status;
}

export function useDelBlockCtxEffect(blockCtx: IBlockCtx, isDynamic: boolean) {
  react.useEffect(() => {
    if (!blockCtx.mounted) {
      markBlockMounted(blockCtx);
    }
    return () => delBlockCtx(blockCtx.key, isDynamic);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockCtx]);
}

export function useIsFirstRender(blockCtx: IBlockCtx, isDynamic: boolean) {
  const ref = react.useRef({ isFirst: true, key: blockCtx.key });
  if (ref.current.key !== blockCtx.key) {
    // works for hot reload
    delBlockCtx(ref.current.key, isDynamic);
    ref.current.isFirst = true;
    ref.current.key = blockCtx.key;
  }
  return ref;
}
