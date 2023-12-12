import type { CoreApiCtx } from '../types/api-ctx';

/**
 * 强制更新
 */
export function useForceUpdate(apiCtx: CoreApiCtx): () => void {
  const updater = apiCtx.hookImpl.useForceUpdate();
  return updater;
}
