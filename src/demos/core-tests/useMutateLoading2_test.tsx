import { share, useAtom, useMutateLoading } from 'helux';

const [dictAtom, , ctx] = share({ a: 1, b: { b1: 1 } }, { moduleName: 'uml' });
const delay = (ms = 1000) => new Promise((r) => setTimeout(r, ms));
const witness = ctx.mutate({
  deps: () => [dictAtom.b.b1],
  task: async ({ draft, input }) => {
    await delay(1000);
    draft.a += input[0];
  },
  immediate: true,
  desc: 'changeA',
});
const changeB1 = () => {
  ctx.setDraft(draft => draft.b.b1 += 1);
};

export default function Demo() {
  // 或写为
  // const [ dict ] = ctx.useState();
  const [dict] = useAtom(dictAtom);

  // or: ctx.useMutateLoading();
  const [ld] = useMutateLoading(dictAtom);
  console.log('ld.changeA.loading', ld.changeA.loading);

  return (
    <div>
      {ld.changeA.ok && <h1>{dict.a}</h1>}
      {ld.changeA.loading && <h1>loading...</h1>}
      {ld.changeA.err && <h1>{ld.changeA.err.message}</h1>}
      <button onClick={changeB1}>changeB1</button>
    </div>
  );
}