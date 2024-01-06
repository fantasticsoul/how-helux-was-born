
```ts
export function merge(dict: Dict) {
  const root = currentDraftRoot();
  if (!root.isFake && root.draftRoot) {
    Object.assign(root.draftRoot, dict);
  }
}

export function replace(newState: any) {
  const root = currentDraftRoot();
  if (!root.isFake && root.isAtom) {
    root.draftRoot.val = newState;
  }
}
```


```ts
  // 见 AtomTupleSetState 解释，解决箭头函数里对 draft 做单值修改时会出现 ts 报错的问题
  const setState = isPrimitive ? insSetState : insSetDraft;

  /**
 * 元组第二位参数的修改状态句柄，针对原始值 atom 指向 SetState，接受返回值，
 * 针对非原始值 atom 指向 SetDraft，不接受返回值，此时箭头函数里对draft做单值修改时，
 * 函数体没有 {} 包裹也不会因为箭头函数的隐式返回值而报 ts 错误
 * ```ts
 * const [baseAtom, setAtom] = atom(3000, { moduleName: 'baseAtom' });
 * setAtom(a => a + 1); // ✅ 这里 cb 返回的是 number，ts 校验通过
 * setAtom(a => 's'); // ❌ 这里 cb 返回的是 string, ts 校验失败
 * 
 * const [baseAtom2, setAtom2, ctx] = atom({ a: 1, b: 2 }, { moduleName: 'baseAtom2' });
 * // 发现是非 primitive atom ，setAtom2 指向 ctx.setDraft, setDraft 是默认忽略返回值的
 * setAtom2(draft => draft.a = 1) // ✅ 这里 cb 返回的是 number，但此时 setAtom2 不处理返回值，类型也不校验，故这里也能通过
 * ctx.setDraft(draft => draft.a = 1) // ✅ ts 校验通过
 * ctx.setState(draft => draft.a = 1) // ❌ ts 校验失败
 * ```
 */
export type AtomTupleSetState<T = any> = T extends ReadOnlyAtom ? T['val'] extends Primitive ? SetState<T> : SetDraft<T> : SetDraft<T>;

```