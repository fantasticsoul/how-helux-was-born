import { faker } from '@faker-js/faker';
import { defineStore } from '@helux/store-pinia';
import { original, limuUtils } from 'limu';

const disableProxy = false;
const listLen = 1;

export interface IItem {
  id: string,
  pid: string,
  name: string,
  weight: number,
  height: number,
  desc: {
    x: number,
    y: number,
    grade: number,
    age: number,
  },
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  address: string;
  items: IItem[];
}

function newItems(pid: string) {
  const length = faker.number.int({ min: 1, max: 1 });
  const items = Array.from({ length }, () => ({
    id: faker.string.uuid(),
    pid,
    name: faker.person.fullName(),
    weight: faker.number.int({ min: 10, max: 100 }),
    height: faker.number.int({ min: 10, max: 200 }),
    desc: {
      x: faker.number.int({ min: 1, max: 10 }),
      y: faker.number.int({ min: 1, max: 20 }),
      grade: faker.number.int({ min: 1, max: 6 }),
      age: faker.number.int({ min: 1, max: 100 }),
    },
  }));
  return items;
}

function newUserList() {
  const users = Array.from({ length: listLen }, () => {
    const id = faker.string.uuid();
    return {
      id,
      name: faker.person.fullName(),
      email: faker.internet.email(),
      address: faker.location.streetAddress(),
      items: newItems(id),
    };
  });
  return users;
}

const api = {
  fetchUsers: async () => {
    return newUserList();
  },
}

export default defineStore('shop', {
  state: () => ({
    users: [] as IUser[],
    currentUser: null as null | IUser,
    xx: null as null | IUser,
    shopName: 'initial',
    infoName: null as any,
    info: {
      name: { first: 'first', last: 'last' },
      addrs: [{ name: 'bj' }, { name: 'sh' }],
    },
  }),
  getters: {
    userMark() {
      return this.users.length + '_' + Date.now();
    },
  },
  actions: {
    async fetchUsers() {
      this.users = await api.fetchUsers();
    },
    updateName(inputItem: IItem) {
      const { id, pid } = inputItem;
      const users = this.users;

      console.time('find item');
      // const oriUsers = original(users)
      // const userIdx = oriUsers.findIndex(v => v.id === pid);
      // const itemIdx = oriUsers[userIdx]?.items.findIndex(v => v.id === id);
      // const item = users[userIdx]?.items[itemIdx];

      const user = users.find(v => v.id === pid) || null;
      const item = user?.items.find(v => v.id === id);

      const meta = limuUtils.getDraftMeta(user);
      console.log('--->', meta);

      console.timeEnd('find item');
      if (!item) {
        if (this.currentUser) {
          this.currentUser.name = `${Date.now()}`;
          this.currentUser.items[0].name = `${Date.now()}`;
        }
        return;
      }

      const oldName = item.name;
      if (!oldName.includes('_')) {
        item.name = `${item.name}_${Date.now()}`;
        return;
      }

      const [name] = oldName.split('_');
      item.name = `${name}_${Date.now()}`;
      item.weight += 1;
      item.height += 1;
      item.desc.age += 100;
      this.currentUser = user;
      this.xx = user;
    },
    addInfoName() {
      this.infoName = this.info.name;
    },
    delInfoName() {
      this.infoName = null;
    },
    changeInfoName() {
      if (this.infoName) {
        this.infoName.first = Date.now();
      }
    },
    changeInfoDotName() {
      this.info.name.first = String(Date.now());
    },
    updateItem(item: IItem) {
      console.log(item);
    },
  },
  lifecycle: {
    willMount() {
      console.log('--------> fetchUsers');
      this.fetchUsers();
    },
    afterCommit(params) {
      // console.log('afterCommit snap', params.disableProxy, params.snap);
    },
    onWrite(params) {
      // const { fullKeyPath, value } = params;
      // console.log('write', fullKeyPath, value);
    },
  },
}, { disableProxy });
