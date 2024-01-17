import { atom, useWatch } from 'helux';

const [numAtom, setAtom] = atom(1);

let runCount = 0;

function test(){
  expect(runCount).toBe(0);
  setAtom(2);
  expect(runCount).toBe(1);
}

export default function Demo() {
  useWatch(
    () => {
      console.error('trigger watch');
      runCount += 1;
    },
    () => [numAtom],
  );

  return <h1 onClick={test}>test</h1>
}
