import { modelFactory } from 'helux';

const fac = modelFactory((api, name) => {
  const ctx = api.sharex({
    name: 'helux',
    extra: {
      age: 12,
      addr: 'bj',
    },
  }, { moduleName: name });
  const { state } = ctx;

  const derivef = ctx.defineFullDerive()({
    reversedName() {
      return state.name.split('').reverse().join('');
    }
  });

  return {
    derivef,
  };
});

const model1 = fac.build('model1');
