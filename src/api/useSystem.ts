import { System, SystemInfo } from './imported';
import { defineStore } from 'pinia';

export interface SystemState {
  ready: boolean;
  info: SystemInfo;
}

export const useSystemStore = defineStore('system', {
  state: () => {
    return { ready: false, info: <SystemInfo>{} };
  },
  // could also be defined as
  // state: () => ({ count: 0 })
  actions: {
    async get() {
      const { data, error } = await System.System();
      if (error) {
        throw new Error(error.text);
      }
      this.ready = true;
      this.info = data;
    },
  },
});
