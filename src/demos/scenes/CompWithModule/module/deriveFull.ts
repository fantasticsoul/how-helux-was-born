import { IDeriveFnParams } from 'helux';
import { state } from './state';

export function go(params: IDeriveFnParams) {
  return state.val.f + 100;
}
