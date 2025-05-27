## store-pinia  速览
TLDR，我们首先简单过一下v5带来的[@helux/store-pinia](https://github.com/heluxjs/helux/tree/master/packages/helux-store-pinia)库吧，它是一个**简单**、**易用**、**类型安全**、**性能高效**的react状态库，基于[helux](https://heluxjs.github.io/helux/)构建，100%对齐[pinia](https://github.com/vuejs/pinia)使用方式，并额外提供了更多pinia做不到的特性，访问[此链接](https://codesandbox.io/p/sandbox/helux-store-pinia-forked-xqw3ks?file=%2Fsrc%2FLikePinia.tsx%3A7%2C1-39%2C4)体验示例吧。

### 安装

```bash
# 内部自动安装 peer 依赖 helux@5.* 版本
npm i @helux/store-pinia@latest
```

### 定义状态（必须）
配置`state`字典工厂函数即可
```ts
const counterStoreCtx = defineStore("Counter", {
  state: () => ({ count: 1, mountCount: 1 }),
});

// 创建好即可组件外使用，无需激活过程
// counterStoreCtx.{ state, actions, getters, useStore, useLoading, getSnap, reset ... }
```

### 配置可缓存的计算属性（可选）

```ts
const counterStoreCtx = defineStore("Counter", {
  	state: () => ({ count: 1, mountCount: 1 }),
    getters: {
    // 由 state 派生出 double ，上游依赖不变化时此函数不再重复计算
    double() {
      return this.count * 2;
    },
    // 由其他 getters 派生出 plus10 ，上游依赖不变化时此函数不再重复计算
    plus10() {
      return this.double + 10;
    },
  },
});
```

### 配置同步或异步方法（可选）

```ts
const counterStoreCtx = defineStore("Counter", {
  // state, getters
  actions: { // 函数体修改的是limu生成的结构共享的副本
    // 同步方法
    changeCount(payload: number) {
      this.count = payload;
    },
    // 异步方法
    async changeCountSync(p1: number, p2: number) {
      this.changeCount(p1);
      await delay();
      this.count += p2;
    },
  },
});
```

### 生命周期（可选）

```ts
const counterStoreCtx = defineStore("Counter", {
  // lifecyle 里可以访问 actions 调用方法
  // lifecycle的方法由框架负责调用，在 actions 里是访问不到的（类型上已屏蔽），由框架负责调用
  lifecycle: {
    // 【可选】第一个使用当前共享对象的组件实例将要挂载时触发 willMount
	// 【可选】第一个使用当前共享对象的组件实例挂载完毕触发 mounted
	// 【可选】最后一个使用当前共享对象的组件实例卸载前触发 willUnmount
    mounted() {
      // this.changeCount(888);
      this.mountCount += 1;
    },
	// or willMount willUnmount
  },
});
```

### 组件内使用状态

组件内使用状态，并调用方法修改

```jsx
function Counter() {
  const store = counterStoreCtx.useStore();
  // 此组件依赖仅是 count ( 支持默认6层深度收集，可独立配置)
  return (
    <div>
      <h3>total {store.count}</h3>
      <button onClick={() => store.changeCountSync(1, 2)}>changeCountSync</button>
      <button onClick={() => store.changeCount(Date.now())}>changeCount</button>
    </div>
  );
}
```

### 组件内直接定义修改方式
此种方式不推荐，尽量统一走 actions，方便devtool可追溯
```jsx
function Demo() {
  const store = storeCtx.useStore();
  // 定义一个临时的修改状态的方法
  const onClick = () => {
    // 注：这里修改的是内部指向的临时副本，修改完毕后会自动结束生成新的结构共享的状态
    store.count++; 
  }
  const seeSnap(){
    console.log(storeCtx.getSnap());
  };
}
```

### 组件内使用函数运行状态

```jsx
function CounterWithLoading() {
  const store = counterStoreCtx.useStore();
  const ld = counterStoreCtx.useLoading();
  // 可获取到所有关系的 action 函数运行状态
  const { ok, loading, err } = ld.changeCountSync;

  return (
    <div>
      {ok && <h1>{store.count}</h1>}
      {loading && <h1>loading...</h1>}
      {err && <h1>{err.message}</h1>}
      <button onClick={() => store.changeCountSync(1, 2)}>
        changeCountSync
      </button>
      <button onClick={() => store.changeCount(Date.now())}>changeCount</button>
    </div>
  );
}
```

### 配置 devtool 插件

```js
import { HeluxPluginDevtool } from '@helux/plugin-devtool';
import { addPlugin } from '@helux/store-pinia';

addPlugin(HeluxPluginDevtool);
```
### 添加自定义插件
接收来自 helux 内部的各种事件并做对应处理

![image.png](https://km.woa.com/asset/000100022504008cc22e8e6815439b01?height=656&width=1870)

```ts
import { addPlugin, IPlugin } from '@helux/store-pinia';

const MyPlugin: IPlugin = {
  install(pluginCtx) {
    pluginCtx.on('ON_SHARE_CREATED', (dataInfo) => {
      // do some staff here
      // console.log('ON_SHARE_CREATED', dataInfo);
    });
    pluginCtx.on('ON_DATA_CHANGED', (dataInfo) => {
      // console.log('ON_DATA_CHANGED', dataInfo);
    });
  },
  name: 'MyPlugin',
};
addPlugin(MyPlugin);
```

### 添加自定义中间件
中间件在变更提交之前按添加顺序依次执行
```ts
import { addMiddleware, Middleware } from '@helux/store-pinia';

const myMiddleware: Middleware = (mid) => {
  if (mid.moduleName) { // 来自某个模块
    mid.draft.timestamp = new Date(); // 修改一下事件戳
  }
}
```

### one more thing
如何不喜欢state打散到store上（defineStore这样做是为了和pinia对齐），可以使用 `defineLayeredStore`，这样就可从 `this.state`上独立获取状态了

```js
const counterStoreCtx = defineLayeredStore("Counter", {
  state: () => ({ count: 1, mountCount: 1 }),
  getters: {
    double() {
      return this.state.count * 2;
    },
    actions: {
      change() {
        // this.state.count 
      }
    }
  },
});

// 组件里从 userState 获取状态，从 useGetters 获取派生
function Demo(){
  const [ state ] = storeCtx.useState();
  // state.xxx
  const getters = storeCtx.useGetters();
  // getters.xxx
}
```


## Atom 的困局
开篇提到**Atom 的困局**这个关键词，是因为看到了`react`的atom状态库鼻祖[recoil](https://github.com/facebookexperimental/Recoil)在2025月2月2日进入归档状态，意味着这个实验性的状态库已彻底弃坑，不再提供任何维护服务而有感而发。

![image.png](https://km.woa.com/asset/00010002250400fb2b854d6d3849bc01?height=808&width=2414)

当然了用户依然可以从他的接任者[jotai](https://github.com/pmndrs/jotai)这里继续畅游在atom的世界里，但`atom`真的那么完美吗？为何`recoil`弃坑呢，这里从我的理解层面聊聊`atom`现在面临的困局。

### atom 是什么
聊困局之前，先谈谈`atom`是什么，让未体验过的用户先在全局层面了解这个概率后，我们在抽丝剥茧的挖出这些问题。

2020的时候，facebook开源了一个全新的状态库`recoil`，在里面提出了`atom`这个概念，号称以更细粒度的方式管理react应用状态。

![image.png](https://km.woa.com/asset/00010002250400e549f4b9cf54476001?height=1466&width=1790)

从上图可看出recoil提到的`atom`概率更像一种更小粒度的共享状态单元（即原子化的状态管理方式），方便人们自低而上的去组织你的应用状态，强调去中心化管理。

举个例子，我么使用`atom`接口创建一个字符串类型的共享状态
```ts
const inputValueState = atom({
  key: "inputValue",
  default: ""
});
```

然后组件中就用钩子`useAtom` 来使用你的共享状态了

```jsx
const InputA = () => {
  const [value, setValue] = useRecoilState(inputValueState);
  return <input value={value} onChange={e => setValue(e.target.value)} />;
};
```

当然你也可以使用`selectors`来派生你的共享状态，并配合`useRecoilValue`来在组件里使用

```jsx
import { useRecoilValue } from 'recoil'; 

export const prefixedInputValue = selector({
  key: 'prefixedInput',
  get: ({ get }) => {
    const input = get(inputValueState);
    return `hello_${input}`;
  },
});

function MyComponent() {   
	const prefixedInput = useRecoilValue(prefixedInputValue);   
	return <h1>{prefixedInput}</h1>
}
```

以上就是一个简单的`atom`示例简介，而`jotai`则是更进一步的去掉`key`定义，让书写更简单高效。


```
// 组件外定义
const countAtom = atom(0);
// 组件中使用
const [ count, setCount ] = useAtom(countAtom);
<h1 onClick={()=>setCount(v=>v+1)}>{count}</h1>
```

但随着人们大规模使用`atom`后发现并发那么相信的美好...

### atom过多与过大的矛盾

主要体验再 atom过多与更新粒度过大之间的矛盾，如何在两者之间找到平衡点是一个较大的心智负担。

准确的说`atom`强调小而美，这本生不是`atom`的问题，但应用开发者往往在构建复杂应用时，共享状态拆的过细就面临着海量atom的问题，和应用的状态建模是分裂的。

```js
const userInfoAtom = atom({ info: ... });
const userNameAtom = atom('hi atom');
const userAddrAtom = atom('beijin');
const userAgeAtom = atom({ realAge:1, dispalyAge: 30 });
// ...etc
```

而把`atom`定义得过大，又会面临更新粒度过大的问题，因为atom的响应更新机制是只要atom更新，使用这个atom的组件就重绘，

```js
const userAtom = atom({ User });

// userAtom 拆分到各个组件中使用时，修改user下任意一个属性均导致所有组件重绘
```

### 完美的atom存在么

到这里我们抛出一个命题：完美的atom应该是怎样的，它存在么？

在我的心目中，atom 应该满足以下条件:

- atom 定义可大可小，不应该成为性能瓶颈。
- atom可自底向上组合，也可自顶而下的拆分，不限制使用方式。
- atom 依然可无缝对接redux社区大量的优秀生态，而不是另起炉灶自称一派

号称atom理念完美继任者的`jotai`依然只是对api语法做了改良，并不算是彻底革新，作者也深知`atom`碎片化的问题，又出了个使用代理对象构建的状态库[voltio](https://github.com/pmndrs/valtio)来满足此类用户的需求，集中定义状态、派生来满足大型应用的建模，但它也只是对`mobx-react`做语法改良，并无其他特殊亮点。

同时该作者还同时提供了 `zustand` 来接任 redux ，以便提高react开发体验，所以不放大胆一点，如果 atom 还能像 redux 那样去组织代码并复用redux生态也是极好的。

### 完美的atom应是如此

如果能像`vue3`那样运行atom就能彻底革新atom的使用体验，存在这样的库么，这就是[helux](https://github.com/heluxjs/helux)诞生的初衷：使用 Proxy 构建 atom 世界！

可以近似理解为  `jotai` + `voltio` +  `zustand` = `helux`，依托于强大的底层api，这3种编码方式都能使用 `helux`去实现。

初识helux，看起来几乎和`jotai`一模一样

```jsx
import { atom, useAtom } from 'helux';
const [numAtom] = atom(1); // { val: 1 }

function Demo() {
  const [num, setAtom] = useAtom(numAtom); // num 自动拆箱
  // onClick=()=>setAton(v=>v+1); // 也支持回调形式
  return <h1 onClick={()=>setAtom(Math.random()}>{num}</h1>;
}
```

但我们进一步看，helux使用了Proxy来创建atom，进入修改时提供的是副本，用户可以对任意节点修改，由于有依赖收集功能只会影响使用了改节点的视图重绘

```jsx
import { useAtom } from 'helux';
const [objAtom, setObj] = atom({ a: 1, b: { b1: 1 } });

// 修改草稿，生成具有数据结构共享的新状态，当前修改只会触发 Demo1 组件渲染
setObj((draft) => (draft.a = Math.random()));

function Demo1() {
  const [obj] = useAtom(objAtom);
  // 仅当 obj.a 发生变化时才触发重渲染
  return <h1>{obj.a}</h1>;
}

function Demo2() {
  const [obj] = useAtom(objAtom);
  // 仅当 obj.b.b1 发生变化时才触发重渲染
  return <h1>{obj.b.b1}</h1>;
}
```

依赖收集是实时的，故对ui里的依赖追踪会更加精确

```
import { atomx } from 'helux';
const { state, setDraft, useState } = atomx({ a: 1, b: { b1: 1 } });
const changeA = () => setDraft((draft) => (draft.a += 1));
const changeB = () => setDraft((draft) => (draft.b.b1 += 1));
function Demo1() {
  const [obj] = useState();
  // 大于 3 时，依赖为 a, b.b1  
  if (obj.a > 3) {
    return (<h1>{obj.a} - {obj.b.b1} </h1>);
  }

  // <=3 时，依赖仅为 q
  return <h1>{obj.a} </h1>;
}
```

为了让依赖收集过程更加高效，不可变数据没有使用`immer`库作为底层，而是重新实现了比`immer`快至少10倍左右（不冻结场景）的[limu](https://github.com/tnfe/limu/issues)，仅测试碎片化小数据场景可达30多倍，

![image.png](https://km.woa.com/asset/000100022504006ef8071120e8452801?height=1024&width=1998)

然后才依托`limu`继续构建了高效的响应式atom状态库[helux](https://heluxjs.github.io/helux/)

![image.png](https://km.woa.com/asset/00010002250400da7021c9d216400501?height=1206&width=2864)

## V5发布atom体验再提升

收集了不少用户的建议并经过一段时间的打磨后，再次正式宣布`helux` 5.0大版本发布了，你可以使用以下命令安装最新版本体验或使用

```bash
npm i helux@latest
```

v5.0 版本里带来了一下最新特性

### 新增 lifecycle 定义

在 recoil 或 jotai 里，如果想对共享状态初始化时机做精细化的控制，仅当有组件使用时才初始化，没有组件时就清理是办不到的.

如果我们采用react的自身的思路去做，大概如下:

-  模拟willMount提前获取

```jsx
function Demo(){
   const fetchRef = useRef(false);
   if(!fetchRef.current){
      fetchRef.current = true;
      fetchData().then(...); // 初始你的atom
   }
}
```

-  模拟mounted获取

```
function Demo(){
   useEffect(()=>{
     fetchRef.current = true;
      fetchData().then(...); // 初始你的atom
   }, []);
}
```

-  模拟 willUnmount 获取

```
   useEffect(()=>{
     return ()=> console.log('clear logic');
   }, []);
```

对于非共享状态这样做没问题，但是提升为状态后，这样的代码就行不通了，因为只需要第一个组件发起请求即可，其他的复用，通常我们可以认为使用顶层组件来做这个事情，但这是一个**极其脆弱**的约定，同时共享状态何时该清理以便**减轻内存消耗**也是一个问题。

框架层面提供`lifecycle`接口可完美解决上述问题（框架内部很容易知道共享状态被多少组件使用中），用户不需要关注组件位置在哪里，如何设计第一个请求再哪里发起，或者改造底层`fetch`请求只允许同一时间发起一个，只需要定义`lifecycle. willMount`或者`lifecycle.mounted`来告诉框架，当前共享状态存在有第一个组件开始将要挂载时或者第一个组件挂载完毕时去做对应的事情（例如请求数据），存在最后一个组件将要卸载时去做对应的事情（例如状态清理），将用户彻底从`react`自身的生命周期里解放出来（react的生命周期只能服务于本地状态，应对共享状态存在天然的不足）。

有了 lifecycle 后，我么现在可以这样组织代码了

```js
const atomCtx = atomx({ User ... })
atomCtx.defineLifecycle({
	// 【可选】第一个使用当前共享对象的组件实例将要挂载时触发 willMount
	willMount(){ /** code */ },
	// 【可选】第一个使用当前共享对象的组件实例挂载完毕触发 mounted
	mounted(){ /** code */ },
	// 【可选】最后一个使用当前共享对象的组件实例卸载前触发 willUnmount
	willUnmount(){ /** code */ },
})
```

### 更稳定的 useEffect

react18之后提供严格模式，在严格模式下的 useEffect 会产生双调用问题，号称是为了在开发模式下帮助用户加粗不合规范的 useEffect 编写方式（18版本之后 useEffect 是用来推荐作为 dom 操作的后门之用的，即逃生舱模式）

```js
React.useEffect(()=>{
	console.log('mounted');
	return ()=> console.log('clear up');
}, []);

// 组件初次挂载时，打印
// mounted
// clear up
// mounted

卸载后后，再打印
// clear up
```

但对部分传统用户的确会照成困扰，v5之后提供更稳定的 `useEffect`句柄，支持 18 19版本，支持`StrictMode`组件包裹在任意节点也能有效工作

```js
import {useEffect, useLayoutEffect} from 'helux';

// 同样是上面的例子，组件初次挂载时，打印
// mounted

// 卸载时，打印
// clear up
```

### atom支持类组件使用

虽然react推崇函数式组件，对于部分依然习惯类组件的用户来说，在v5版本里可以用类组件来消费 atom 了，且依然可享受100%到的类型提示，和函数组件一样拥有依赖收集和精确更新能力。

-  连接单个 atom

```jsx
import { atom, withAtom, assignThisHX } from 'helux';
const [numAtom] = atom({ num: 1, info: { addr: 'bj' } });

class DemoCls extends React.Component<any> {
  // 先声明，运行时会由 withAtom 将值注入到此属性上
  private hx = assignThisHX(this);
  render() {
    // this.hx.atom.setState 修改atom
    console.log(this.hx.atom.state); // 获取到 atom state
  }
}

const IDemo = withAtom(DemoCls, { atom: numAtom });
```

-  连接多个 atom

```jsx
import { atom, withAtom, assignThisHX } from 'helux';

const [numAtom] = atom({ num: 1, info: { addr: 'bj' } });
const [bookAtom] = atom({ name: 'book', list: [] });

class DemoCls extends React.Component {

  private hx = assignThisHX(this);
  addNum = () => {
    this.hx.atoms.num.setState((draft: any) => void (draft.num += 2));
  };
  render() {
    // 从 atoms 字典上去各个子 atom
    const { num: { state }, book: { state } } = this.hx.atoms;
    return <div>hello num {state.num}<button onClick={this.addNum}> add num </button></div>;
  }
}

const IDemo = withAtom(DemoCls, { atoms: { num: numAtom, book: bookAtom } });
```

### 发布 @helux/store-pinia 

伴随v5我们发布了进一步强化`atom`使用体验，弱化`atom`概念的状态库`@helux/store-pinia`，它基于`helux`向上构建，提供100%的类型安全，且100%对齐`pinia`使用体验，同时还结合`helux`自身的特色消除了`pinia`部分弱点。

- 无需在组件里激活

`pinia`的`defineStore`返回的是一个钩子函数，必须在组件里使用后才能激活，`@helux/store-pinia`则可以任意地方使用

```ts
const storeCtx = defineStore('Counter', {
  state: () => ({ count: 0 }),
  getters: {/** */ },
  actions: {/** */ },
});

// 拿到的 storeCtx 可以任意地方使用
storeCtx.useStore(); // 组件里
storeCtx.getStore(); // 组件外
```

- 100% 对齐helux底层能力

依赖收集（默认收集到6层深度）
```
function Counter() {
  const store = storeCtx.useStore();
  // 此处仅依赖 count
  return (<h3>count: {store.count}</h3>;
}
```

信号更新（无hook）

```
import { $ } from 'helux';

function Counter() {
  // 此处仅依赖 count
  return (<h3>count: {$(store.count)}</h3>;
}
```

静态块更新（无hook）

```
import { block } from 'helux';

const Counter = ()=> block(()=>({
	<div>{store.count}</div>;
}))
```

- 增强了devtool，store-pinia 也能完美使用 devtool工具了

例如以下代码包含有一个复杂的 action 函数 fetchList

![image.png](https://km.woa.com/asset/000100022504004e67979ce0d6452a01?height=1496&width=1402)

对应 devtool 可以查看变更明细

![image.png](https://km.woa.com/asset/00010002250400c3b408e4d2664c3f01?height=1122&width=1900)

