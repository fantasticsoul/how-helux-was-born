import React from 'react';
import { mutate, share, useGlobalId, $, action, markRaw } from 'helux';
import { MarkUpdate, Entry } from '../comps';
import { dictFactory, delay } from '../logic/util';

const [state, setPrice, ctxp] = share(dictFactory, {
  moduleName: 'DefineApi',
  rules: [
    { when: state => [state.info.name], globalIds: ['any'] }
  ],
});

// ctxp.setOnReadHook((params)=>{
//   console.log('--> fullKeyPath', params.fullKeyPath);
// });

const { actions } = ctxp.defineActions()({
  change({ draft }) {
    draft.info.name = new Date().toLocaleTimeString();
    if(!draft.extra.any){
      const dict = markRaw(dictFactory());
      console.log('dict ', dict);
      draft.extra.any = dict;
    }else{
      draft.extra.any.info.name = `${Date.now()}`;
      console.log(JSON.stringify(draft));
    }
  }
});

function Name() {
  const [state] = ctxp.useState();
  console.log(state.extra.any?.info.name);

  return <h1>{state.extra.newName}</h1>
}

function Any() {
  useGlobalId('any');
  console.log(state);
  return (
    <div>
      <h3>{Date.now()}</h3>
      <h3>{state.extra.any?.info.name}</h3>
    </div>
  );
}

const Demo = () => (
  <Entry fns={actions}>
    <Any />
    <Name />
    {$(ctxp.state.info.name)}
  </Entry>
);

export default Demo;
// 