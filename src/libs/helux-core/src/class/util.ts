import { CLASS_ATOM } from '../consts';
import { useAtomXForClass } from '../hooks/useAtom';
import { useDerived } from '../hooks/useDerived';
import { atomx } from '../factory/createShared';
import type { CoreApiCtx } from '../types/api-ctx';
import type { IAtomCtx, IBindAtomOptions, ICompAtomCtx } from '../types/base';

export type HX = { atom: ICompAtomCtx, atoms: Record<string, ICompAtomCtx>; deriveds: Record<string, any> };

export interface IInnerBindAtomOptions extends IBindAtomOptions {
  atomKey: string;
  atomKeys: string[],
  hx?: HX;
  ins?: any;
}

export interface IInnerWithAtomOptions extends IInnerBindAtomOptions {
  isPropsProxy?: boolean;
}

let dAtomCtx: IAtomCtx;
function getDefaultAtom(apiCtx: CoreApiCtx) {
  if (!dAtomCtx) {
    dAtomCtx = atomx(apiCtx, { tip: 'default atom' }, { moduleName: 'DefaultClassAtom' });
  }
  return dAtomCtx;
}

function getDefaultHX() {
  return { atom: {}, atoms: {}, deriveds: {} } as HX;
}

export function Empty(props: any) {
  const renderUI = props.renderUI;
  return renderUI ? renderUI() : null;
}

export function mergeAtoms(apiCtx: CoreApiCtx, options?: IBindAtomOptions) {
  // 未透传 atom 的话，给一个空的 atom 对象，用于保证 hx.atom 运行时不出 undefined 的情况
  const dAtomCtx = getDefaultAtom(apiCtx);
  const { atom = dAtomCtx.state, atomOptions, atoms = {}, atomsOptions = {} } = options || {};

  // 用户可能透传的 atom 和 atoms 里某一个 atom 是同一个对象，这里优化一下，
  // 避免这种因独立 atom 和 atoms 里重复时，存在根值依赖导致重复渲染问题（根因是对同一个 atom 对象调用了两次 useAtom ）
  let atomKey = CLASS_ATOM as unknown as string;
  let singleAtom = atom;
  Object.keys(atoms).forEach((key) => {
    if (atoms[key] === atom) {
      atomKey = key;
      singleAtom = atoms[key];
    }
  });

  const targetAtoms = Object.assign({ [atomKey]: singleAtom, ...atoms });
  const targetAtomsOptions = Object.assign({ [atomKey]: atomOptions, ...atomsOptions });
  const atomKeys = Object.keys(atoms) as string[];
  if (!atomKeys.includes(atomKey)) {
    atomKeys.push(atomKey);
  }

  return { atoms: targetAtoms, atomsOptions: targetAtomsOptions, atomKeys, atomKey };
}

export function makeAtomFnComp(apiCtx: CoreApiCtx, UIComp: any, options: IInnerBindAtomOptions) {
  const {
    atomKey,
    atomKeys,
    atoms = {},
    atomsOptions = {},
    deriveds = {},
    derivedsOptions = {},
    // 如 forClass 为 true，透传的 hx 可让类组件上的 props.hx 是一个稳定引用
    hx: outHX,
    ins: outIns,
  } = options;
  const { createElement, useRef } = apiCtx.react;

  return function Comp(props: any) {
    // console.trace('Render Atom Comp');
    const dataRef = useRef<{ hx: HX, ins: any }>({ hx: outHX || getDefaultHX(), ins: outIns || {} });
    const { hx, ins } = dataRef.current;

    atomKeys.forEach((key) => {
      const atom = atoms[key];
      // eslint-disable-next-line
      const { insCtx, ...atomCtx } = useAtomXForClass(apiCtx, atom, atomsOptions[key]);
      if (atomKey === key) {
        Object.assign(hx.atom, atomCtx);
      }
      hx.atoms[key] = atomCtx;
      ins[key] = insCtx;
    });

    Object.keys(deriveds).forEach((key) => {
      const result = deriveds[key];
      const options = { ...(derivedsOptions[key] || {}) };
      // eslint-disable-next-line
      const resultTuple = useDerived(apiCtx, result, options);
      hx.deriveds[key] = resultTuple;
    });

    const propsWithHX = { ...props, hx };
    return createElement(UIComp, propsWithHX);
  };
}
