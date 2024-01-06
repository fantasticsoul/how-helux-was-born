import { atom, useAtom, atomx, $ } from 'helux';

const [baseAtom, setAtom] = atom(3000, { moduleName: 'baseAtom' });
setAtom(a => a + 1); // 这里 cb 返回的是 number，校验通过
// setAtom(a => 's'); // 这里 cb 返回的是 string, 校验失败

const [baseAtom2, setAtom2, ctx] = atom({ a: 1, b: 2 }, { moduleName: 'baseAtom2' });
// 发现是非 primitive atom ，setAtom2 指向 ctx.setDraft, setDraft 是默认忽略返回值的
setAtom2(draft => void (draft.a = 1)) // 这里 cb 返回的是 number，但此时 setAtom2 不处理返回值，类型也不校验，故这里也能通过
ctx.setDraft(draft => draft.a = 1) // ok
// ctx.setState(draft => draft.a = 1) // bad