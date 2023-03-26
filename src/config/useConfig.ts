import { toRefs } from 'vue';
import { drawerMenu } from './drawerMenu';
import { siteConfig } from '../APPLICATION/site';

export default function useConfig() {
  return {
    ...toRefs(drawerMenu),
    site: siteConfig,
    activityReport: 300, // in seconds
    heartbeatTick: 30, // in seconds
    useIdle: false,
  };
}
