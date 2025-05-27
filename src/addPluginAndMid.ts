import { HeluxPluginDevtool } from '@helux/plugin-devtool';
// import { addPlugin, addMiddleware, IPlugin } from 'helux';
// import { addPlugin, addMiddleware, IPlugin } from './demos/best-practice/helux-store-pinia/api';
import { addPlugin, addMiddleware, IPlugin, Middleware } from '@helux/store-pinia';

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

addPlugin(HeluxPluginDevtool);
addPlugin(MyPlugin);
addMiddleware((mid) => {
  if (mid.moduleName) { // 来自某个模块
    mid.draft.timestamp = new Date(); // 修改一下事件戳
  }
});
