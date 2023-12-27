import { getAtom, atomx } from 'helux';

// 此处使用 sharex 替代 share ，方便一次解构即可获取 reactive 对象
// const { state, reactive } = sharex({ a: 100, b: { b1: 1, b2: 2 }, c: { c1: 1, c2: 2 } });
const { state, reactive } = atomx({ a: 100, b: { b1: 1, b2: 2 }, c: { c1: 1, c2: 2 } });

async function modStateByReactive() {
  reactive.b.b1 = 100;
  reactive.c.c1 = 100;
  console.log(reactive.b.b1); // 100
  console.log(reactive.c.c1); // 100

  const val1 = getAtom(state);
  console.log(val1.b.b1); // 1
  console.log(val1.c.c1); // 1
  await Promise.resolve(1);
  const val2 = getAtom(state);
  console.log(val2.b.b1); // 100
  console.log(val2.c.c1); // 100
}

modStateByReactive();