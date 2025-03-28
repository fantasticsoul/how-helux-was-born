// @ts-nocheck
import {
  atom, withAtom, assignThisHX, block, derive, getHX, makeWithAtomOptions, useAtom,
  type HXType,
} from 'helux';
import React from 'react';
import { MarkUpdate, Entry } from './comps';
import { log, logRed } from './logic/util';

const [numAtom, setAtom, ctx] = atom({ num: 1, info: { addr: 'bj' }, show: true, time: Date.now() }, { moduleName: 'Atom' });

const plus1000 = derive(() => numAtom.val.num + 1000);

const { actions } = ctx.defineActions()({
  changeAddr({ draft }) {
    draft.info.addr = `add_${Date.now()}`;
  },
});

setInterval(() => {
  // setAtom(draft => void (draft.info.addr = String(Date.now())));
  // setAtom(draft => void (draft.time = Date.now()));
}, 1000);

// const woptions = makeWithAtomOptions({ atom: { xx: 1 }, atoms: { num: numAtom } });
const woptions = makeWithAtomOptions({ atom: numAtom, atoms: { num: numAtom }, isPropsProxy: true });
// const woptions = makeWithAtomOptions({ atoms: { num: numAtom }, isPropsProxy: true });

class DemoCls extends React.Component<any> {
  public state = { hideNum: false };
  private hx = assignThisHX<HXType<typeof woptions>>(this);
  public ref = React.createRef();
  private cool = 'father cool';

  constructor(p, c) {
    console.log('Call constructor', p, c);
    super(p, c);
    const hx = getHX<HXType<typeof woptions>>(p, c);
    console.log(hx);
    // // const a = hx.atom.state;
    // console.log(getHX<HXType<typeof woptions>>(p, c));
    // console.log('p, c', p, c);
  }

  // componentWillReceiveProps(nextProps: Readonly<any>, nextContext: any): void {
  //   console.log(' DemoCls componentWillReceiveProps', JSON.parse(JSON.stringify(this.hx)));
  // }

  // componentWillUpdate(nextProps: Readonly<any>, nextState: Readonly<{}>, nextContext: any): void {
  //   console.log(' DemoCls componentWillUpdate', JSON.parse(JSON.stringify(this.hx)));
  // }

  // componentDidMount() {
  //   console.log('componentDidMount this.hx', this.hx);
  // }

  addNum = () => {
    this.hx.atoms.num.setState((draft: any) => void (draft.num += 2));
  };

  changeAddr = () => {
    actions.changeAddr();
  };

  hide = () => {
    this.setState({ hideNum: true });
  };

  show = () => {
    this.setState({ hideNum: false });
  };

  render() {
    const { num: { state, ...renderInfo } } = this.hx.atoms;
    console.log('render DemoCls', renderInfo.getDeps(), renderInfo.insKey);

    if (this.state.hideNum) {
      return <h1>hide num <button onClick={this.show}>show num</button></h1>;
    }

    console.log(' ----  render start ---- ');
    const ui = (
      <MarkUpdate info={renderInfo}>
        hello num {state.num}
        <br />
        addr {state.info.addr}
        <button onClick={() => setAtom(draft => void (draft.num += 1))}>add num</button>
        <button onClick={this.addNum}>add num 2</button>
        <button onClick={this.changeAddr}>changeAddr</button>
        <button onClick={this.hide}>hide num</button>
        {/* <IDemo2 ref={this.ref} mark="IDemo2 in demo1" /> */}
      </MarkUpdate>
    );
    console.log(' ----  render end ---- ');
    return ui;
  }
}

class DemoCls2 extends React.Component<any> {
  public state = { hideNum: false };
  private hx = assignThisHX(this);
  hide = () => {
    this.setState({ hideNum: true });
  };

  show = () => {
    this.setState({ hideNum: false });
  };

  render() {
    console.log('DemoCls2');
    const { num: [result, , info] } = this.hx.deriveds;

    if (this.state.hideNum) {
      return <h1>hide num <button onClick={this.show}>show num</button></h1>;
    }

    return (
      <MarkUpdate info={info}>
        result {result}
        <button onClick={this.hide}>hide num</button>
      </MarkUpdate>
    );
  }
}

const IDemo = withAtom(DemoCls, woptions);
const IDemo2 = withAtom(DemoCls2, { deriveds: { num: plus1000 }, isPropsProxy: true });

function FnDemo() {
  const [state, , renderInfo] = useAtom(numAtom);
  console.log('render FnDemo', renderInfo.getDeps(), renderInfo.insKey);

  return (
    <MarkUpdate info={renderInfo}>
      hello num {state.num}
      <br />
      addr {state.info.addr}
    </MarkUpdate>
  );
}

// const Demo = block(() => (
//   <Entry>
//     <IDemo mark="mark" />
//     {/* <FnDemo mark="FnDemo" /> */}
//     {/* {numAtom.val.show && <IDemo mark="mark" />} */}
//     {/* {numAtom.val.show && <IDemo2 mark="mark" />} */}
//     {/* {numAtom.val.time} */}
//     <br />
//     {/* {plus1000.val} */}
//     {/* <IDemo mark="mark" /> */}
//     <button onClick={() => setAtom(draft => void (draft.num += 1))}>add</button>
//     <button onClick={() => setAtom(draft => void (draft.show = false))}>hide</button>
//     <button onClick={() => setAtom(draft => void (draft.show = true))}>show</button>
//     <button onClick={() => setAtom(draft => void (draft.time = Date.now()))}>change time</button>
//     <button onClick={() => setAtom(draft => void (draft.info.addr = String(Date.now())))}>change addr</button>
//   </Entry>
// ));

const Demo = () => (
  <Entry>
    <IDemo mark="mark" />
    {/* <IDemo mark="mark" /> */}
    {/* <FnDemo mark="FnDemo" /> */}
    {/* {numAtom.val.show && <IDemo mark="mark" />} */}
    {/* {numAtom.val.show && <IDemo2 mark="mark" />} */}
    {/* {numAtom.val.time} */}
    <br />
    {/* {plus1000.val} */}
    {/* <IDemo mark="mark" /> */}
    <button onClick={() => setAtom(draft => void (draft.num += 1))}>add</button>
    <button onClick={() => setAtom(draft => void (draft.show = false))}>hide</button>
    <button onClick={() => setAtom(draft => void (draft.show = true))}>show</button>
    <button onClick={() => setAtom(draft => void (draft.time = Date.now()))}>change time</button>
    <button onClick={() => setAtom(draft => void (draft.info.addr = String(Date.now())))}>change addr</button>
  </Entry>
);

export default React.memo(Demo);
