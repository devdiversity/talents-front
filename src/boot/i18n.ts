import { boot } from 'quasar/wrappers';
import { createI18n, Locale, Path } from 'vue-i18n';

import messages from 'src/i18n';
import { ComponentInternalInstance } from 'vue';
import { useSystemStore } from 'src/stores/system';

type MissingHandler = (locale: Locale, key: Path, vm?: ComponentInternalInstance, type?: string) => string | void;

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

let data = {};

const missingHandler: MissingHandler = (locale: Locale, key: Path, vm?: ComponentInternalInstance, type?: string): string | void => {
  //console.log(locale, key, vm, type);
  const systemStore = useSystemStore();
  const props = key.split('.');
  const last = props[props.length - 1];
  const tempObject = {};
  let container = tempObject;

  props.map((k, i, values) => {
    container = (container as { [key: string]: unknown })[k] = i == values.length - 1 ? `??${last}` : {};
  });
  data = mergeDeep(data, tempObject);
  systemStore.setTranslation(tempObject);
};

export default boot(({ app }) => {
  const systemStore = useSystemStore();
  const i18n = createI18n({
    legacy: false,
    locale: 'en-US',
    messages,
    missing: missingHandler,
  });
  systemStore.setTranslation(messages);
  // Set i18n instance on app
  app.use(i18n);
});
