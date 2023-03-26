import { boot } from 'quasar/wrappers';
import { useSystemStore } from 'src/stores/system';
import { Idle } from 'src/libs/idle/idle';
import { api, ApiRestResponse } from 'src/api/imported';

export const idle = new Idle({});

const ApiSystemError = (result: ApiRestResponse, url: string, handler: string) => {
  console.info('ApiSystemError', result, url, handler);
};

const ApiLogError = (url: string, handler: string, data: unknown) => {
  console.info('ApiLogError', url, handler, data);
};

const ApiError500 = (url: string, handler: string, data: unknown) => {
  console.info('ApiLogError', url, handler, data);
};

const ApiWaitingRecconnect = (handler: string, dbOk: boolean, ok: boolean, tentative: number) => {
  const systemStore = useSystemStore();
  systemStore.setServerOnLine(ok);
  console.log('ApiWaitingRecconnect', handler, dbOk, ok, tentative);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const StoreRequest = (handler: string, data: ApiRestResponse | null, error: string | null, ok: boolean) => {
  //console.log(handler, data, error, ok);
};

export default boot(async () => {
  api.ApiSystemError = ApiSystemError;
  api.ApiLogError = ApiLogError;
  api.ApiError500 = ApiError500;
  api.ApiWaitingRecconnect = ApiWaitingRecconnect;
});
