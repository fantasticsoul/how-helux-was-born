import { sharex, share, atom } from 'helux';

type State = {
  list: { name: string }[] | undefined;
  info: number;
};

function getInitial(): State {
  return {
    list: undefined,
    info: 0,
  };
}

export type PlainObject = Record<string, {} | undefined | null>;

type SS = { a: number | undefined | null | string | boolean | symbol | any[] | Map<string, any> };
const ss = { a: 1 };
const ss1 = (): SS => ({ a: 1 });

const ctx = sharex(getInitial, { moduleName: 'test' });
