import { KEY_SPLITER } from '../consts';
import { getInternalByKey } from './state';

export function fmtDepKeys(depKeys: string[]) {
  return depKeys.map(key => {
    const [skey, ...rest] = key.split('/');
    return `${getInternalByKey(Number(skey)).usefulName}/${rest.join(KEY_SPLITER)}`;
  });
}
