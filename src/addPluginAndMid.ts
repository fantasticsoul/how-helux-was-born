import { HeluxPluginDevtool } from '@helux/plugin-devtool';
import { addPlugin, addMiddleware, IMiddlewareCtx } from 'helux';

addPlugin(HeluxPluginDevtool);
addMiddleware((mid) => {
  // console.log(mid);
});
