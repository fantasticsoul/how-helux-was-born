import { sharex, $ } from 'helux';
import { Entry, MarkUpdate } from '@helux/demo-utils';

// ATTENTION: 测试 reactive
const { reactive, useReactive } = sharex({ a: 1, b: { b1: { b2: 1, ok: true } } });

setInterval(() => {
  reactive.a += 1;
  reactive.b.b1.b2 += 1;
}, 2000);

function toogleOkOut() {
  reactive.b.b1.ok = !reactive.b.b1.ok;
}

function Demo() {
  const [reactive, , info] = useReactive({ id: 'Demo' });
  return <MarkUpdate info={info}>{reactive.a}</MarkUpdate>
}
function Demo2() {
  const [reactive, , info] = useReactive({ id: 'Demo2' });
  return <MarkUpdate info={info}>{reactive.b.b1.b2}</MarkUpdate>
}
function Demo3() {
  const [reactive, , info] = useReactive();
  const toogle = () => reactive.b.b1.ok = !reactive.b.b1.ok;
  return <MarkUpdate info={info}><div onClick={toogle}>{`${reactive.b.b1.ok}`}</div></MarkUpdate>
}

export default function Comp() {
  return <Entry fns={[toogleOkOut]}>
    <Demo />
    <Demo2 />
    <Demo3 />
    {$(reactive.a)}
    <br />
    {$(reactive.b.b1.ok, val => `${val}`)}
  </Entry>;

}