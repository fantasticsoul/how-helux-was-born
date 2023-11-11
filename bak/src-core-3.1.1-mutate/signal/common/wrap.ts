import { useDerivedSimpleLogic } from '../../hooks/common/useDerivedLogic';
import { useSharedSimpleLogic } from '../../hooks/common/useSharedLogic';
import { react } from '../../react';
import type { DerivedAtom, Dict, Fn } from '../../types';
import type { FunctionComponent } from '../../types-react';
import { getVal, noop } from '../../utils';

export const alwaysEqual = () => true;

interface IWrapSignalComp {
  sharedState: Dict;
  depKey: string;
  keyPath: string[];
  compare?: Fn;
}

/** for perf, no options here */
export function wrapComp(Comp: any, displayName: string, needMemo?: boolean, compare?: Fn): FunctionComponent {
  const CompVar = Comp as FunctionComponent;
  CompVar.displayName = displayName;
  return needMemo ? react.memo(CompVar, compare) : CompVar;
}

export function wrapSignalComp(options: IWrapSignalComp): FunctionComponent {
  const { sharedState, depKey, keyPath, compare } = options;
  const valHook = { get: noop };
  const Comp = function () {
    const insCtx = useSharedSimpleLogic(sharedState);
    insCtx.recordDep(depKey, true);
    const val = getVal(sharedState, keyPath);
    valHook.get = () => val;
    return val;
  };
  return wrapComp(Comp, 'HeluxPrimitiveSignal', true, compare);
}

export function wrapDerivedAtomSignalComp(derivedAtom: DerivedAtom, compare?: Fn): FunctionComponent {
  const Comp = function () {
    const fnCtx = useDerivedSimpleLogic({ fn: derivedAtom, forAtom: true });
    return fnCtx.proxyResult.val as any; // auto unbox atom result
  };
  return wrapComp(Comp, 'HeluxDerivedAtomSignal', true, compare);
}

export function wrapDerivedSignalComp(derivedResult: DerivedAtom, keyPath: string[], compare?: Fn) {
  const Comp = function () {
    useDerivedSimpleLogic({ fn: derivedResult, forAtom: false });
    return getVal(derivedResult, keyPath);
  };
  return wrapComp(Comp, 'HeluxDerivedSignal', true, compare);
}
