import { $, BlockView } from 'helux';
import { memo, useEffect, forwardRef } from 'react';
import { defineStore } from '@helux/store-pinia';

const groupList = [
  { id: 2, name: '分组1' },
  { id: 3, name: '分组2' },
  { id: 207, name: '分组3' },
];

const list2 = [{ id: 20, name: '分组1-内容1' }];
const list3 = [{ id: 92, name: '分组2-内容2' }];
const list207 = [{ id: 93, name: '分组3-内容3' }];

const getRules = (id) => {
  if (id === 2) {
    return list2;
  }
  if (id === 3) {
    return list3;
  }
  if (id === 207) {
    return list207;
  }
};

const ruleApi = {
  getAllRuleGroups: async () => {
    return groupList;
  },

  getRulesByGroupId: async (groupId) => {
    return getRules(groupId);
  },
};

const ruleStoreCtx = defineStore('ruleStore22', {
  state: () => ({
    sname: 'ver1',
    groups: [],
    groupRules: {},
    currentGroup: null,
    info: {
      name: { first: 'first', last: 'last' },
      addrs: [{ name: 'bj' }, { name: 'sh' }],
    },
  }),
  actions: {
    /** 旧值陷阱 */
    setCurrentGroup(group) {
      console.log('set group', group);
      // this.info.name.first = `new_setCurrentGroup_${Date.now()}`;

      // group.name = `new_currentGroup_${Date.now()}`;
      // console.log('modify group', group);

      this.currentGroup = group;

      this.currentGroup.name = `new_currentGroup_${Date.now()}`;
      console.log('modify group', this.currentGroup);

      // console.log(JSON.stringify(this.currentGroup || {}));
    },

    async fetchGroupRules(group) {
      // console.log('fetchGroupRules 1',JSON.stringify(this.currentGroup || {}))
      // const data = await ruleApi.getRulesByGroupId(group.id);
      // console.log('fetchGroupRules 2',JSON.stringify(this.currentGroup || {}))
      // this.groupRules[group.id] = data;
    },

    async loadAllRuleGroups() {
      console.log('loadAllRuleGroups');
      const groupList = await ruleApi.getAllRuleGroups();
      this.groups = groupList;
    },

    updateCurr() {
      if (this.currentGroup) {
        this.currentGroup.name = `new_${Date.now()}`;
      }
    },
  },
  lifecycle: {
    afterCommit(params) {
      // console.log('afterCommit snap', params.snap);
    },
    onWrite(params) {
      const { fullKeyPath, value } = params;
      // console.log('write', fullKeyPath, value);
    },
  },
});

const GroupList = memo(() => {
  const store = ruleStoreCtx.useStore();

  async function onSelectGroup(group) {
    store.setCurrentGroup(group);
    await store.fetchGroupRules(group);
  }

  return (
    <div>
      <div>
        <div>current name: {store.currentGroup?.name}</div>
        {store.groups.map((group) => {
          return (
            <div key={group.id} onClick={() => onSelectGroup(group)}>
              <span>
                {group.id} {group.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

const RuleList = memo(() => {
  const store = ruleStoreCtx.useStore();
  return (
    <div>
      {!store.currentGroup || !store.groupRules[store.currentGroup.id] ? (
        <h2>Empty</h2>
      ) : (
        <h2>{store.groupRules[store.currentGroup.id][0].name}</h2>
      )}
    </div>
  );
});

const App = () => {
  console.log('Render App');
  const store = ruleStoreCtx.useStore();
  useEffect(() => {
    console.log('call loadAllRuleGroups');
    store.loadAllRuleGroups();
  }, [store]);

  return (
    <div>
      <GroupList />
      <RuleList />
      {/* {$(store.currentGroup, (v)=>v? v.name : 'no' )} */}
    </div>
  );
};

const Name = (props, b) => {
  const { first, last } = props;
  console.log('b', b);
  console.log(props);
  return <div>{`name is ${first} ${last}`}</div>;
}

const getProps = () => {
  const { first, last } = ruleStoreCtx.state.info.name;
  return { first, last };
};

const Block = forwardRef(({ p, c }, ref) => $(p, c));

const Wrap = () => {
  console.log('>>> Render Wrap');
  return (
    <div>
      <App></App>
      {$(ruleStoreCtx.reactive.sname)}
      <button
        onClick={() => {
          ruleStoreCtx.reactive.sname = `store_ver_${Date.now()}`;
        }}
      >
        change ver
      </button>
      <button
        onClick={() => {
          ruleStoreCtx.reactive.info.name.first = `store_ver_${Date.now()}`;
        }}
      >
        change name
      </button>
      {$(getProps, Name)}
      <BlockView data={getProps} comp={Name} />
      <Block c={Name} p={getProps} />
      {/* {$(ruleStoreCtx.state.currentGroup, (v) => v ? v.name : 'no')} */}
      <br />
      {/* {$(ruleStoreCtx.state.info.name.first)} */}
      <br />
      {/* {$(ruleStoreCtx.state.info.name, (v) => `name is ${v.first} ${v.last}`)}
      {$(ruleStoreCtx.state.info.name, (v) => `name is ${v.first} ${v.last}`)} */}
      {/* {$(
        () =>
          `name is ${ruleStoreCtx.state.info.name.first} ${ruleStoreCtx.state.info.name.last}`
      )} */}
      <br />
      {/* {$(ruleStoreCtx.state.info.addrs[0].name)} */}
    </div>
  );
};

setTimeout(() => {
  // ruleStoreCtx.reactive.info.name.first = `new_${Date.now()}`;
  // ruleStoreCtx.reactive.name =  `store_${Date.now()}`;
}, 2000);

setTimeout(() => {
  // ruleStoreCtx.reactive.info.name.first = `new_${Date.now()}`;
  // ruleStoreCtx.reactive.name =  `store_${Date.now()}`;
}, 6000);

setInterval(() => {
  // ruleStoreCtx.reactive.info.name.last = `new_last_${Date.now()}`;
}, 4000);

export default memo(Wrap);
