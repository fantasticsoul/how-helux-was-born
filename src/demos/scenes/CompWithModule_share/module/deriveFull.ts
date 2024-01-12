import { defineDeriveFnItem, defineDeriveTask } from 'helux';
import type { DeriveFnParams, DeriveFnItem, BoundStateInfo } from './state';
import { delay } from '../../../logic/util';

export function go(params: DeriveFnParams) {
  return params.state.f + 100;
}

export function test(params: DeriveFnParams) {
  const { state } = params;
  const map: Record<number, any> = {};
  state.list.forEach(item => map[item.id] = item);
  return map;
}

/**
 * 通过 DeriveFnItem 主动约束结果返回类型和 deps 返回类型，同时 deps 返回类型自动透传给 params.input
 */
export const fTask: DeriveFnItem<number, [number]> = {
  deps: (info) => [info.state.f],
  fn: (params) => {
    return params.input[0];
  },
  task: async (params) => {
    delay(1000)
    return params.prevResult + 100;
  },
}

export const fTask2 = defineDeriveFnItem<DeriveFnItem<number, [number]>>({
  deps: (info) => [info.state.f],
  fn: (params) => {
    return params.input[0];
  },
  task: async (params) => {
    delay(1000);
    return params.prevResult + 100;
  },
});

/**
 * 通过 defineDeriveTask 约束结果返回类型，自动推导出 deps 返回类型并透传给 params.input
 */
export const f2 = defineDeriveTask(
  (info: BoundStateInfo) => [info.state.f] as const,
)<number>({
  fn: (params) => {
    return params.input[0];
  },
  task: async (params) => {
    delay(1000)
    return params.prevResult + 100;
  },
});
