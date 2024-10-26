import { atomx } from "helux";
const stateAtom = atomx(
  [
    {
      id: 1,
      name: "John",
      age: 21,
    },
    {
      id: 2,
      name: "Jane",
      age: 22,
    },
  ],
  {
    stopArrDep: false,
  }
);

function ArrTest() {
  const [state] = stateAtom.useState();

  return (
    <>
      {state.map((item) => {
        return (
          <div key={item.id}>
            {item.name}: {item.age}
          </div>
        );
      })}
      <button
        onClick={() => {
          stateAtom.setDraft((draft) => {
            for (const item of draft) {
              console.log('---> item', item);
              item.age += 1;
            }
          });
        }}
      >
        increase by for-of
      </button>

      <button
        onClick={() => {
          stateAtom.setDraft((draft) => {
            for (const index in draft) {
              if (Object.prototype.hasOwnProperty.call(draft, index)) {
                const element = draft[index];
                element.age += 1;
                draft[index] = element;
              }
            }
          });
        }}
      >
        increase by for-in
      </button>
      <button
        onClick={() => {
          stateAtom.setDraft((draft) => {
            draft[0].age += 1;
          });
        }}
      >
        increase by index
      </button>
    </>
  );
}

export default function App() {
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
      <ArrTest />
    </div>
  );
}
