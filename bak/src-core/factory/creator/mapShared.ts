import { setInternal } from '../../helpers/state';
import type { AsyncSetState, IInnerSetStateOptions, KeyInsKeysDict, SetAtom, SetState, SharedState, InnerSetState } from '../../types';
import { canUseDeep, isFn } from '../../utils';
import { buildInternal, InsCtxDef } from './buildInternal';
import { prepareDeepMutate } from './mutateDeep';
import { prepareNormalMutate } from './mutateNormal';
import { parseRules, parseSetOptions, ParsedOptions } from './parse';
import { createSyncFnBuilder, createSyncerBuilder } from './sync';

export function mapSharedToInternal(sharedState: SharedState, options: ParsedOptions) {
  const { rawState, sharedKey, deep, forAtom, before, mutate, loc, mutateFns, loadingMode, stateType } = options;
  const insCtxMap = new Map<number, InsCtxDef>();
  const key2InsKeys: KeyInsKeysDict = {};
  // id --> insKeys
  const id2InsKeys: KeyInsKeysDict = {};
  const ruleConf = parseRules(options);
  const isDeep = canUseDeep(deep);

  const setStateImpl = (partialState: any, options: IInnerSetStateOptions = {}) => {
    if (partialState === internal.rawStateSnap) {
      // do nothing
      return { draft: {}, getPartial: () => partialState, finishMutate: () => partialState };
    }

    const mutateOptions = { ...options, forAtom, internal, sharedState };
    // deep 模式修改： setState(draft=>{draft.x.y=1})
    if (isFn(partialState) && isDeep) {
      // now partialState is a draft recipe callback
      const handleCtx = prepareDeepMutate(mutateOptions);
      // 后续流程会使用到 getPartial 的返回结果是为了对齐非deep模式的 setState，此时只支持一层依赖收集
      const getPartial = () => partialState(handleCtx.draft);
      return { ...handleCtx, getPartial };
    }

    const handleCtx = prepareNormalMutate(mutateOptions);
    const getPartial = () => (isFn(partialState) ? partialState(handleCtx.draft) : partialState);
    return { ...handleCtx, getPartial };
  };
  // for inner call
  const innerSetState: InnerSetState = (partialState, options) => {
    const ret = setStateImpl(partialState, options);
    return ret.finishMutate(ret.getPartial());
  };
  // setState definition
  const setState: SetState = (partialState, options) => {
    const ret = setStateImpl(partialState, parseSetOptions(options));
    return ret.finishMutate(ret.getPartial());
  };
  // async setState definition
  const asyncSetState: AsyncSetState = async (partialState, options) => {
    const ret = setStateImpl(partialState, parseSetOptions(options));
    const partialVar = await Promise.resolve(ret.getPartial());
    return ret.finishMutate(partialVar);
  };
  // setAtom implementation
  const setAtom: SetAtom = (atomVal, options) => {
    const atomState = !isFn(atomVal) ? { val: atomVal } : atomVal;
    setState(atomState, parseSetOptions<any>(options));
  };
  const sync = createSyncFnBuilder(sharedKey, rawState, setState);
  const syncer = createSyncerBuilder(sharedKey, rawState, setState);
  const setDraft = forAtom ? setAtom : setState;

  const internal = buildInternal(options, {
    setState,
    asyncSetState,
    setAtom,
    setDraft,
    setStateImpl,
    innerSetState,
    sharedState,
    insCtxMap,
    key2InsKeys,
    id2InsKeys,
    ruleConf,
    isDeep,
    before,
    mutate,
    mutateFns,
    loc,
    syncer,
    sync,
    forAtom,
    loadingMode,
    stateType,
  });

  setInternal(sharedState, internal);
}
