import {
  defineStore as defineStoreFn,
  defineLayeredStore as defineLayeredStoreFn,
} from './src';
import type { defineStore as dt, defineLayeredStore as dlt } from './index';
export { addMiddleware, addPlugin, type IPlugin } from 'helux';

export const defineStore = defineStoreFn as typeof dt;

export const defineLayeredStore = defineLayeredStoreFn as typeof dlt;
