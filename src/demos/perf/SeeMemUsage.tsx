import React, { memo, useEffect, forwardRef } from 'react';
import { shallowCompare, useLocalForceUpdate, useLockDep } from 'helux';
import { MarkUpdate, Entry } from '@/demos/comps';
import shop, { type IUser, type IItem } from '@/demos/_util/shop';

const stItemWrap = { border: '1px solid grey', padding: '6px', margin: '6px' };
const stUserWrap = { border: '1px solid blue', padding: '6px', margin: '6px' };
const stDiv = { width: '50%', verticalAlign: 'top', display: 'inline-block' };
// const compare = (o1: any, o2: any) => shallowCompare(o1, o2, false);
const compare = shallowCompare;

const Item = memo((props: { item: IItem }) => {
  const { item } = props;
  const val = useLockDep(item);
  const onClick = () => {
    // const oldName = item.name;
    // if (!oldName.includes('_')) {
    //   item.name = `${item.name}_${Date.now()}`;
    //   return;
    // }

    // const [name] = oldName.split('_');
    // item.name = `${name}_${Date.now()}`;
    shop.actions.updateName(item);
  };

  const updateItem = (e: any) => {
    e.stopPropagation();
    shop.actions.updateItem(item);
  };
  return (
    <MarkUpdate>
      <div key={val.id} onClick={onClick} style={stItemWrap}>
        <div>id: {val.id}</div>
        <div>name: {val.name}</div>
        <div>weight: {val.weight}</div>
        <div>height: {val.height}</div>
        <div>desc.x: {val.desc.x}</div>
        <div>desc.y: {val.desc.y}</div>
        <div>desc.age: {val.desc.age}</div>
        <button onClick={updateItem}>update user.item</button>
      </div>
    </MarkUpdate>
  );
}, compare);


const User = memo((props: { user: IUser }) => {
  const { user } = props;
  console.log('see user: 1 user', user);
  return (
    <MarkUpdate top>
      <div key={user.id} onClick={() => console.log(user.name)} style={stUserWrap}>
        <div>id: {user.id}</div>
        <div>name: {user.name}</div>
        <div>email: {user.email}</div>
        <div>address: {user.address}</div>
        <div>{user.items.map(item => <Item key={item.id} item={item} />)}</div>
      </div>
    </MarkUpdate>
  );
}, compare);

function usePrintCosts() {
  const timeKey = React.useRef(0);
  timeKey.current += 1;
  const key = timeKey.current
  console.time('UserListCosts_' + key);
  React.useEffect(() => {
    console.timeEnd('UserListCosts_' + key);
  }, [key]);
}

const UserList = memo(() => {
  const store = shop.useStore({ arrIndexDep: false });
  // const store = shop.useStore({ arrLenOnly: true });
  usePrintCosts();
  const f = useLocalForceUpdate();
  console.log('see user: users list', store.users);

  return (
    <MarkUpdate top>
      <button onClick={() => f()}>force update</button>
      <h3>userMark: {store.userMark}</h3>
      {store.users.map((user) => <User key={user.id} user={user} />)}
    </MarkUpdate>
  );
});

const UserMark = memo(() => {
  const store = shop.useStore();
  return (
    <MarkUpdate top>
      <h3>userMark: {store.userMark}</h3>
    </MarkUpdate>
  );
});

const CurrentUser = memo(() => {
  const store = shop.useStore();
  return (
    <MarkUpdate top>
      CurrentUser: {store.currentUser && <User user={store.currentUser} />}
    </MarkUpdate>
  );
});
const CurrentUser2 = memo(() => {
  const store = shop.useStore();
  return (
    <MarkUpdate top>
      CurrentUser xx: {store.xx && <User user={store.xx} />}
    </MarkUpdate>
  );
});


const InfoName = memo(() => {
  const store = shop.useStore();
  const first = store.infoName?.first;

  return (
    <MarkUpdate top>
      InfoName: {first}
    </MarkUpdate>
  );
});

const InfoDotName = memo(() => {
  const store = shop.useStore();
  const first = store.info.name.first;

  return (
    <MarkUpdate top>
      InfoDotName: {first}
    </MarkUpdate>
  );
});

const SeeMemUsage = () => {
  console.log('Render App');

  return (
    <div>
      <div>
        <button onClick={shop.actions.fetchUsers}>refresh list</button>
        <button onClick={shop.actions.addInfoName}>addInfoName</button>
        <button onClick={shop.actions.delInfoName}>delInfoName</button>
        <button onClick={shop.actions.changeInfoName}>changeInfoName</button>
        <button onClick={shop.actions.changeInfoDotName}>changeInfoDotName</button>
      </div>
      <div style={stDiv}>
        <CurrentUser />
        <CurrentUser2 />
        <InfoName />
        <InfoDotName />
      </div>
      <div style={stDiv}>
        <h6>UserMark</h6>
        <UserMark />
        <h6>UserList</h6>
        <UserList />
      </div>
    </div>
  );
};

export default SeeMemUsage;
