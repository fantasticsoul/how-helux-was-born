import { isFn } from '@helux/utils';
import { getApiCtx } from '../common/transfer';
import { initBlockCtx } from '../helpers/blockCtx';
import { signalLogic } from './signal';
import { getSignalViewOptions, getBlockViewOptions } from './common/util';

function mayLogNotFnError(input: any, label: string) {
  if (!isFn(input)) {
    console.error(`found ${label} not a function, this may lead an unexpected render result!`);
  }
}

function signalViewLogic(options: any) {
  const apiCtx = getApiCtx();
  mayLogNotFnError(options.input, 'SignalView input');
  return signalLogic(apiCtx, options);
}

function blockViewLogic(options: any) {
  const apiCtx = getApiCtx();
  mayLogNotFnError(options.input, 'BlockView data');
  const { current: blockCtx } = apiCtx.react.useRef(initBlockCtx(true, options.enableStatus));
  options.blockCtx = blockCtx;
  return signalLogic(apiCtx, options);
}

export const COMPS = {
  SignalView(props: any, ref: any) {
    const options = getSignalViewOptions(props, ref);
    return signalViewLogic(options);
  },
  SignalV2(props: any, ref: any) {
    const options = getSignalViewOptions(props, ref, true);
    return signalViewLogic(options);
  },
  BlockView(props: any, ref: any) {
    const options = getBlockViewOptions(props, ref);
    return blockViewLogic(options);
  },
  BlockV2(props: any, ref: any) {
    const options = getBlockViewOptions(props, ref, true);
    return blockViewLogic(options);
  },
};
