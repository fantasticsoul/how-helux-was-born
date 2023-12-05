
## TODO

思考数组下标依赖如何记录
1 限制记录数量
2 默认不记录

配置`arrIndexDep=false`，关闭数组下标记录
```ts
useAtom(xxx, {indexDep:false})
```

配置`arrLoop=false`，关闭数组下标记录

```ts
change: list[0]
notify: list list[0]
> default: arrLoop=true arrIndexDep = true

comp:
read: list[0]
deps: list list[0]

arrDep=true arrIndexDep = true ---> deps: list list[0] list[...]
arrDep=true arrIndexDep = false ---> deps: list
arrDep=false ---> deps: list[0] list[...]
```


## 常见错误示例

### useAtom,useShared deps 函数里传入其他共享状态依赖

```ts
useAtom(xxAtom, { deps: state=>[state.a, otherAtom.b] });
```

## 常见技巧

useWatch 配合 useAtom,useShared 一起使用时，deps 函数里的依赖会记录为固定依赖项

```ts
const [ xx ] = useAtom(xxAtom);
useWatch(()=>{}, ()=>[xx]); // 记录根值自身依赖
useWatch(()=>{}, ()=>[xx.a, xx.b]); // 记录子节点依赖
```
