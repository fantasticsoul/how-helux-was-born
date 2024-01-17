import { share, derive, watch } from 'helux';

const [num, setNum] = share({ a: 1, b: 2 });
const change = () => {
  setNum(draft => { draft.a += 10; draft.b += 11; });
  console.log(`num is ${num.a}`);
};

const plusA = derive(() => {
  console.log('trigger plusA');
  return num.a + 1;
});
const plusB = derive(() => {
  console.log('trigger plusB');
  return num.b + 1;
});
watch((params) => {
  console.log('trigger watch');
  console.log(`plusA: ${plusA.val}  plusB: ${plusB.val}`);
}, () => [plusA, plusB]);


export default function Demo() {
  return <h1 onClick={change}>test</h1>
}
