import { defineStore } from 'pinia';
import { System, SystemInfo } from 'src/api/imported';

export interface SystemState {
  ready: boolean;
  info: SystemInfo;
  serverOnLine: boolean;
  translations: Translations;
}

export interface Translations {
  data: { [key: string]: unknown };
}

const getSystem = async (): Promise<SystemInfo> => {
  const { data, error } = await System.System();
  if (error) {
    throw new Error(error.text);
  }
  return data;
};

/**
 * Performs a deep merge of objects and returns new object. Does not modify
 * objects (immutable) and merges arrays via concatenation.
 *
 * @param {...object} objects - Objects to merge
 * @returns {object} New object with merged key/values
 */
function mergeDeep(...objects: any[]) {
  const isObject = (obj: any) => obj && typeof obj === 'object';

  return objects.reduce((prev, obj) => {
    Object.keys(obj).forEach((key) => {
      const pVal = prev[key];
      const oVal = obj[key];

      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        prev[key] = pVal.concat(...oVal);
      } else if (isObject(pVal) && isObject(oVal)) {
        prev[key] = mergeDeep(pVal, oVal);
      } else {
        prev[key] = oVal;
      }
    });

    return prev;
  }, {});
}

export const useSystemStore = defineStore('system', {
  state: () => {
    return { ready: false, info: <SystemInfo>{}, serverOnLine: true, translations: <Translations>{} };
  },
  getters: {
    roles(state) {
      return state.info.roles;
    },
    version(state) {
      return state.info.version;
    },
    languages(state) {
      return state.info.languages;
    },
    onLine(state) {
      return state.serverOnLine;
    } /* ,
    translations(state) {
      return state.translations;
    }, */,
  },
  actions: {
    async setServerOnLine(status: boolean) {
      this.serverOnLine = status;
    },
    async get() {
      try {
        const data = await getSystem();
        this.ready = true;
        this.info.roles = data.roles;
        this.info.version = data.version;
        this.info.languages = data.languages;
      } catch (err) {
        this.ready = false;
        this.info = <SystemInfo>{};
      }
    },
    async setTranslation(data: any) {
      if (!this.translations.data) this.translations.data = {};
      this.translations.data = mergeDeep(this.translations.data, data);
    },
  },
});
