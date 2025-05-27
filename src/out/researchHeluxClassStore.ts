// @ts-nocheck

// difineStore // return store context
// difineMergedStore // return store context
// difineClassStore // return store context
// difineParamFirstStore // return store context

/**

const clsStore = difineClassStore(ClassStoreTpl);

clsStore.useXXX

withClassStore(ClassComp, clsStore);

ClassComp extends React.Component {

  store1 = getStoreIns(this);

  store2 = getStoreIns(this);
}

 * 
 */

class Text {
  state = { num: 1 }

  mark = 'xxxx'

  get num() {
    console.log('call get num', this)
    return this.state.num + 1;
  }

  foo() {
    console.log('this.state.num', this);
  }
}

function heluxStore(ClassTpl) {
  const ins = new ClassTpl();

  console.log(Object.keys(ins));
  const allPropertyNames = Object.getOwnPropertyNames(ins);
  // 过滤出方法名（这里简单地通过判断属性值是否为函数）
  const methods = allPropertyNames.filter(prop => typeof ins[prop] === 'function');
  const vars = allPropertyNames.filter(prop => typeof ins[prop] === 'object');

  let currentProto = Object.getPrototypeOf(ins);
  const allPropertyNames2 = Object.getOwnPropertyNames(currentProto);
  // 过滤出方法名（这里简单地通过判断属性值是否为函数）
  const methods2 = allPropertyNames2.filter(prop => {
    console.log(prop, typeof ins[prop], ins[prop]);
    return typeof ins[prop] === 'function'
  });
  const vars2 = allPropertyNames2.filter(prop => typeof ins[prop] === 'object');

  // 指向 reactive
  ins.state = { num: 100, tip: 'repalced' };

  console.log('allPropertyNames2', allPropertyNames2);
  console.log('vars2', vars2);
  console.log('methods2', methods2);

  const fakeThis = { state: { www: 1111 } };
  const actionsWarp = {};

  methods2.forEach(m => {
    console.log(m);
    actionsWarp[m] = currentProto[m].bind(ins);
  });

  return new Proxy(ins, {
    get(t, p, r) {
      console.log(t, p, r);
      // 返回 actions.xxx.bind(ins);
      // 返回 actionsWarp[p];
      return t[p];
    },
    set() {
      return false;
    }
  })
}

const store = heluxStore(Text);

export const a = 1;