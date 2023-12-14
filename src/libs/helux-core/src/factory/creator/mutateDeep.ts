import { isJsObj, isObj, isSymbol, tryAlert } from '@helux/utils';
import { createDraft, finishDraft, IOperateParams, limuUtils } from 'limu';
import type { Dict, Ext, ISetFactoryOpts, IInnerSetStateOptions, IMutateCtx } from '../../types/base';
import { genRenderSN } from '../common/key';
import { runMiddlewares } from '../common/middleware';
import { emitDataChanged } from '../common/plugin';
import { newMutateCtx } from '../common/util';
import type { TInternal } from './buildInternal';
import { handleOpSymKey } from './buildShared';
import { commitState } from './commitState';
import { DRAFT_ROOT, MUTATE_CTX, REACTIVE_META } from './current';
import { handleOperate } from './operateState';

interface IPrepareDeepMutateOpts extends ISetFactoryOpts {
  internal: TInternal;
  forAtom: boolean;
}

interface ICommitOpts extends IPrepareDeepMutateOpts {
  desc?: string;
  mutateCtx: IMutateCtx;
  state: any;
}

interface ISnCommitOpts extends ICommitOpts {
  sn: number;
}

function handlePartial(opts: Ext<{ mutateCtx: IMutateCtx }>) {
  const { partial, forAtom, mutateCtx, isPrimitive, draftRoot, draftNode } = opts;
  // 把深依赖和浅依赖收集到的 keys 合并起来
  if (!isObj(partial)) {
    return;
  }
  // 触发 writeKeys 里记录当前变化key
  if (forAtom) {
    // 对于 primitive atom 来说，如果操作了 currentDraftRoot().val=xx 赋值，则丢弃 partial.val
    // 例如写为 sync(to=>to.a, ()=>currentDraftRoot().val=1) 而不是 sync(to=>to.a, draft=>{currentDraftRoot().val=1}) 时
    // 这里的 ()=>currentDraftRoot().val=1 其实还同时返回了值 1，这个 1 被包裹为 { val: 1 } 到这里后，
    // 如果写入就会造成草稿对象被污染，故这里判断一下 mutateCtx.isChanged 做个保护
    const val = partial.val;
    const handleObjVal = () => {
      if (isJsObj(val)) {
        // 仅字典做合并，其他的走完整替换策略
        if (limuUtils.isObject(val)) {
          // [object Object]
          Object.keys(val).forEach((key) => {
            draftNode[key] = (val as any)[key];
          });
        } else {
          draftRoot.val = val;
        }
      }
    };

    if (mutateCtx.handleAtomCbReturn) {
      if (isPrimitive) {
        draftRoot.val = val;
      } else {
        handleObjVal();
      }
    } else {
      // 未做任何改变时，继续处理返回的对象
      handleObjVal();
    }
  } else {
    Object.keys(partial).forEach((key) => {
      draftRoot[key] = partial[key];
    });
  }
}

function alertDeadCycle(internal: TInternal, keys: string[], forFn: boolean, desc?: string) {
  const fn = forFn ? 'fn' : 'task';
  const reason = forFn ? 'by its self' : 'but they are mutate dep keys';
  tryAlert(
    new Error(
      `[only-dev-mode alert] DEAD_CYCLE: found mutate ${fn} ${desc} is changing ${internal.usefulName}(${keys}) `
      + `${reason}, it will cause a dead cycle!`,
    ),
    false,
  );
}

/**
 * mutateNormal 和 mutateDepp 的 finishMutate 里提交之前可复用的公共逻辑
 */
export function beforeCommit(opts: ICommitOpts, innerSetOptions: IInnerSetStateOptions, draftRoot: any) {
  Object.assign(opts, innerSetOptions);
  // sn 序号相同表示同一批次触发重渲染
  // 注意 sn 和 internal.ver 不能画等号，sn 对应的将要执行函数的会有很多（包括异步函数）
  // ver 只代表提交后的最新状态版本号
  opts.sn = opts.sn || genRenderSN();
  opts.from = opts.from || 'SetState';
  const { from, sn, desc, internal } = opts;
  const draft = internal.forAtom ? draftRoot.val : draftRoot;
  internal.before({ from, draftRoot, draft, desc, sn });
  runMiddlewares(internal, draftRoot, draft, sn);
  return opts as ISnCommitOpts; // 已确保打上 sn 标记
}

/**
 * deep模式下，生成limu返回的草稿状态，用户可以对草稿做任意修改，且不会影响原状态
 */
export function prepareDeepMutate(opts: IPrepareDeepMutateOpts) {
  const { internal, desc = '' } = opts;
  const { forAtom, isPrimitive, rawState } = internal;
  const mutateCtx = newMutateCtx(opts);
  const commitOpts = { state: {}, mutateCtx, ...opts, desc };
  const draftRoot = createDraft(rawState, {
    onOperate: (opParams: IOperateParams) => {
      if (isSymbol(opParams.key)) {
        return handleOpSymKey(opParams, forAtom, internal.sharedKey);
      }
      handleOperate(opParams, { internal, mutateCtx });
    },
  });

  // 记录正在执行中的 draftRoot mutateCtx
  DRAFT_ROOT.set(draftRoot);
  MUTATE_CTX.set(mutateCtx);
  let draftNode = draftRoot;
  // atom draft 自动拆箱
  if (forAtom) {
    draftNode = draftRoot.val;
    // 自动拆箱后，有一个隐含的 .val 读依赖被收集到 readKeys，此处刻意清空 readKeys
    // 不清空的话，如下例子因为有隐含的 .val 读取，和 .val 再赋值操作，会误判为有死循环存在
    // 清空了则 .val 读取被抹掉了，死循环探测逻辑就没有误判了
    // atomx(0).mutate(()=>anotherAtom.val+1);
    // 如果人为对 val 读取再赋值，例如使用 draftRoot.val 操作，则探测出存在死循环
    // atomx(0).mutate((draft, { draftRoot })=>draftRoot.val+=1);
    mutateCtx.readKeys = {};
  }

  return {
    draftRoot,
    draftNode,
    finishMutate(partial?: Dict, innerSetOptions: IInnerSetStateOptions = {}) {
      const { writeKeys, writeKeyPathInfo } = mutateCtx;
      // TODO: discussion 是否添加 ignoreCbReturn 参数，允许用户强制忽略 cb 返回值
      handlePartial({ partial, forAtom, mutateCtx, isPrimitive, draftRoot, draftNode });
      const opts = beforeCommit(commitOpts, innerSetOptions, draftRoot);
      mutateCtx.depKeys = Object.keys(writeKeys);
      DRAFT_ROOT.del();
      MUTATE_CTX.del();
      opts.state = finishDraft(draftRoot); // a structural shared obj generated by limu
      const { state, desc } = opts;

      // 做了赋值操作但都是相同的值，结束后的草稿引用不会改变，这里直接结束 finish 流程
      // 例如 { a: { b: 1 } }
      // 某个地方操作 draft=>draft.a.b = 1; // 此操作并没有引起改变
      if (state === internal.rawState) {
        return;
      }
      // 在 operateState 里探测到了 mutate task 使用 draft 或 setState 修改 deps 里声明的依赖值，不再向下继续执行
      // 因 task 检查会重复检测到 fn 里的死循环结果，故这里先提示 task 检查结果
      if (mutateCtx.taskDeadCycleKeys.length) {
        const usingReactive = REACTIVE_META.current();
        alertDeadCycle(internal, mutateCtx.taskDeadCycleKeys, false, usingReactive.desc || desc);
        return;
      }
      // 在 operateState 里探测到了 mutate fn 自我修改导致的死循环，不再向下继续执行
      if (mutateCtx.fnDeadCycleKeys.length) {
        alertDeadCycle(internal, mutateCtx.fnDeadCycleKeys, true, desc);
        return;
      }
      // 在 operateState 里探测到了 mutate task 里使用顶层 reactive 对象修改 deps 里声明的依赖值，不再向下继续执行
      const dcResult = innerSetOptions.beforeCommit?.(mutateCtx);
      if (dcResult) {
        alertDeadCycle(internal, dcResult.dcDepKeys, false, dcResult.desc);
        return;
      }

      mutateCtx.triggerReasons = Object.values(writeKeyPathInfo);
      commitState(opts);
      emitDataChanged(internal, innerSetOptions, desc);

      /**
       * limu 的 immut 接口生成的可读代理对象虽然能总是同步最新的快照，但同步时机是在读取对象任意值那一刻
       * 用户修改完状态后直接使用 console.log(sharedState) 看到的会是旧值打印，其实已经是新值，
       * 需要继续向下读任意一个值即可刷新sharedState，然后再执行 console.log(sharedState) 看到的才是正确的
       * 为避免用户误会这是一个bug，这里提前随便读一个key，帮助用户主动刷新一下 sharedState 值
       */
      // noop(internal.sharedState[mutateCtx.level1Key]);
    },
  };
}
