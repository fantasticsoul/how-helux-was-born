import ReactDOM from 'react-dom/client';
import { memo, useEffect } from 'react';
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

const ruleStoreCtx = defineStore('ruleStore', {
  state: () => ({
    groups: [],
    groupRules: {},
    currentGroup: null,
  }),
  actions: {
    setCurrentGroup(group) {
      this.currentGroup = group;
    },

    async fetchGroupRules(group) {
      const data = await ruleApi.getRulesByGroupId(group.id);
      this.groupRules[group.id] = data;
    },

    async loadAllRuleGroups() {
      const groupList = await ruleApi.getAllRuleGroups();
      this.groups = groupList;
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

const App = memo(() => {
  const store = ruleStoreCtx.useStore();
  useEffect(() => {
    store.loadAllRuleGroups();
  }, [store]);

  return (
    <div>
      <GroupList />
      <RuleList />
    </div>
  );
});


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

