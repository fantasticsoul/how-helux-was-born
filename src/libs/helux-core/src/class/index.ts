import type { CoreApiCtx } from '../types/api-ctx';
import type { IBindAtomOptions, IWithAtomOptions } from '../types/base';
import { CLASS_ATOM } from '../consts';
import { isDerivedAtom, isDerivedResult } from '../factory/common/atom';
import { getInternal } from '../helpers/state';
import { Empty, makeAtomFnComp, mergeAtoms, type HX } from './util';

export function assignThisHX<T extends any = any>(thisRef: any): T {
  return thisRef.props.hx || {};
}

export function getHX<T extends any = any>(props: any, context: any): T {
  const hx = props.hx || context.hx || {};
  const { atom = {}, atoms = {} } = hx;
  // isPropsProxy=false 时，构造器获取的 atom 值是 {}, 需从 atoms 里赋值过去
  if (!atom.state && atoms[CLASS_ATOM]) {
    hx.atom = atoms[CLASS_ATOM];
  }
  return hx;
}

export function makeWithAtomOptions(options: any) {
  return options;
}

export function bindAtom(apiCtx: CoreApiCtx, ClassComp: any, options: IBindAtomOptions) {
  // @ts-ignore 强制踢掉用户可能透传的 hx ins 属性
  const { hx, ins, memo, propsAreEqual, ...rest } = options || {};
  const { atoms, atomsOptions, atomKeys, atomKey } = mergeAtoms(apiCtx, options);
  const FnComp = makeAtomFnComp(apiCtx, ClassComp, { ...rest, atomKey, atomKeys, atoms, atomsOptions });
  // @ts-ignore
  FnComp.displayName = 'HeluxClassWrap';
  return memo ? apiCtx.react.memo(FnComp, propsAreEqual) : FnComp;
}

export function withAtom(apiCtx: CoreApiCtx, ClassComp: any, options?: IWithAtomOptions) {
  const {
    deriveds = {}, derivedsOptions, memo = true, propsAreEqual, isPropsProxy = false,
  } = options || {};
  const { atoms, atomsOptions, atomKeys, atomKey } = mergeAtoms(apiCtx, options);
  const { react } = apiCtx;
  const { createElement, PureComponent, Fragment } = react;
  const ToBeExtendedClass = isPropsProxy === false ? ClassComp : PureComponent;

  class HeluxClass extends ToBeExtendedClass {
    public AtomComp;
    /** hx is short for helux class component atom ctx */
    public hx = { atom: {}, atoms: {}, deriveds: {} } as HX;
    public ins = {} as Record<string, any>;
    public isFirstRender = true;

    constructor(props: any, context: any) {
      const hx = { atom: {}, atoms: {}, deriveds: {} } as HX;

      // Object.keys(atoms) 和 Object.keys(deriveds) 逻辑是为了用户在组件 constructor 里需要获取到 hx 而存在
      // 当 isPropsProxy=false 走反向继承时，用户在 constructor 里时 this.hx 是获取不到值的，需要从 context.hx 获取
      // constructor(props, context){ // context.hx 获取到 hx }
      // 为了能在 isPropsProxy 切换时都能安全获取到 hx，建议用户走 getHX 函数
      // constructor(props, context){ // getHX(props, context) }
      atomKeys.forEach((key) => {
        const atom = atoms[key];
        const internal = getInternal(atom);
        if (!internal) {
          throw new Error('not an atom!');
        }
        hx.atoms[key] = {
          state: internal.sharedState,
          setState: internal.setState,
          time: Date.now(),
          isAtom: internal.forAtom,
          setDraft: internal.setDraft,
          insKey: 0,
          sn: 0,
          getDeps: () => [],
          getPrevDeps: () => [],
        };
      });

      Object.keys(deriveds).forEach((key) => {
        const derived = deriveds[key];
        if (!isDerivedResult(derived)) {
          throw new Error('not a derived atom!');
        }
        // 和 useDerived 行为保持一致
        const val = isDerivedAtom(derived) ? derived.val : derived;
        hx.deriveds[key] = [val, { loading: false, err: null, ok: true }, { time: 0, insKey: 0, sn: 0, getDeps: () => [] }];
      });

      // When calling super() in `HeluxClass`, make sure to pass up the same props that your component's constructor was passed
      // super({ ...props, hx }, context);
      super(props, { ...context, hx });
      Object.assign(this.hx, hx);

      const AtomComp = makeAtomFnComp(apiCtx, Empty, {
        atomKey,
        atomKeys,
        atoms,
        atomsOptions,
        deriveds,
        derivedsOptions,
        hx: this.hx,
        ins: this.ins,
      });

      this.AtomComp = AtomComp;
    }

    componentDidMount() {
      if (!isPropsProxy) {
        // 走反向继承时，要确保用户组件的 componentDidMount 被调用
        super.componentDidMount?.();
      }
    }

    componentDidUpdate(prevProps: any, prevState: any, snapshot?: any) {
      if (!isPropsProxy) {
        // 走反向继承时，要确保用户组件的 componentDidUpdate 被调用
        super.componentDidUpdate?.(prevProps, prevState, snapshot);
      }
    }

    render() {
      let renderUI;
      // 反向继承（默认）
      if (isPropsProxy === false) {
        // now helux class extends ReactClass, call super.render()
        renderUI = () => createElement(Fragment, {}, super.render());
      } else {
        // 属性代理
        const hx = this.hx;
        renderUI = () => createElement(ClassComp, { ...this.props, hx });
      }

      return createElement(this.AtomComp, { renderUI });
    }
  }

  HeluxClass.displayName = 'HeluxClass';
  return memo ? react.memo(HeluxClass, propsAreEqual) : HeluxClass;
}
