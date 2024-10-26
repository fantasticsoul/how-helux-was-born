import { share, block, shallowCompare, getRawState } from "helux";
import React from "react";
import { Entry, MarkUpdate } from "./comps";

const [csate, setState, ctx] = share(
  {
    list: [
      { id: 1, name: "item1", sub: [{ id: 100, name: 'sub_name1' }] },
      { id: 2, name: "item2", sub: [{ id: 101, name: 'sub_name2' }] },
    ],
    desc: 'BlockListNested',
  },
  { moduleName: "BlockListNested" }
);
// const sharedState = csate;
const sharedState = ctx.reactive;

function changeSubListItem(id: number) {
  const idVar = typeof id === 'number' ? id : 1;
  setState((draft) => {
    const idx = getRawState(draft).list.findIndex((v) => v.id === idVar);
    draft.list[idx].sub[0].name = String(Date.now());
  });
}

function addListItem(id: number) {
  setState((draft) => {
    draft.list.push({ id: Date.now(), name: `name_${Date.now()}`, sub: [{ id: Date.now(), name: `sub_${Date.now()}` }] });
  });
}

function changeDesc() {
  setState((draft) => {
    draft.desc = `desc_${Date.now()}`;
  });
}

const SubItem: React.FC<any> = React.memo((props: any) => {
  console.log('render SubItem start');
  const { item } = props;
  const ui = (
    <div>
      <h2>sub_id: {item.id}</h2>
      <h2>sub_name: {item.name}</h2>
      <button onClick={() => changeSubListItem(props.id)}>change item</button>
    </div>
  );
  console.log('render SubItem end');
  return ui;
}, shallowCompare);

const Item: React.FC<any> = React.memo((props: any) => {
  console.log('render Item start');
  const { item } = props;
  const ui = (
    <div>
      <h2>id: {item.id}</h2>
      <h2>name: {item.name}</h2>
      <div>{item.sub.map((v: any) => <SubItem key={v.id} id={item.id} item={v} />)}</div>
    </div>
  );
  console.log('render Item end');
  return ui;
}, shallowCompare);

const r = (cb: any) => cb;

/**
 * 调用 changeListItem 时
 * depKeys: ["3/list", "3/list|0|name"]
 */

// fn deps ['3/list|length', '3/list|0|id', '3/list|1|id']
// block deps: [
//   "3/list",
//   "3/list|length",
//   "3/list|0",
//   "3/list|0|id",
//   "3/list|1",
//   "3/list|1|id"
// ]
const SignalListComp = block(() => {
  console.log('render SignalListComp start');

  // const SignalListComp = r(() => {
  //   console.log('render SignalListComp start');
  //   const [sharedState] = ctx.useState();
  const ui = (
    <MarkUpdate>
      {sharedState.list.map((v) => (
        <Item key={v.id} item={v} />
      ))}
      {/* <div>{sharedState.desc}</div> */}
    </MarkUpdate>
  );
  console.log('render SignalListComp end');

  return ui;
});

// const Desc = block((props, params) => {
//   return (
//     <MarkUpdate>
//       {sharedState.desc}
//     </MarkUpdate>
//   );
// });

const Demo = () => (
  <Entry fns={[changeSubListItem, addListItem, changeDesc]}>
    <SignalListComp />
    {/* <Desc /> */}
  </Entry>
);

export default Demo;
