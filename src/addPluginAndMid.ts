import { HeluxPluginDevtool } from '@helux/plugin-devtool';
import { addPlugin, addMiddleware, IPlugin } from 'helux';

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
  // console.log(mid);
});
