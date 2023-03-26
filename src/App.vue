<template>
  <router-view />
  <q-dialog v-model="offLine">
    <q-card class="bg-white" style="min-width: 400px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">
          {{ $t('error.serveroffline') }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section class="text-bold text-red">
        {{ $t('error.serveroffline-message') }}
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, watch } from 'vue';
import { useAuthStore } from './stores/auth';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { idle } from './boot/api';
import { Users } from 'src/api/imported';
import useConfig from './config/useConfig';

import { useSystemStore } from './stores/system';

export default defineComponent({
  name: 'App',
  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const route = useRoute();
    const authStore = useAuthStore();
    const systemStore = useSystemStore();
    const config = useConfig();
    idle.onReportUserIsIdle = authStore.onReportUserIsIdle.bind(idle);
    idle.onResumeFromIdle = authStore.onResumeFromIdle.bind(idle);

    const { preferences, isIdle, isLogged } = storeToRefs(authStore);

    onMounted(async () => {
      console.log('mounted');
      await systemStore.get();
      await authStore.get();
    });

    watch(
      () => $q.appVisible,
      async (val) => {
        if (val) {
          // test if actual route need permissions
          if (!isLogged.value) {
            await router.push('/');
          }
        }
        console.log(val ? 'App became visible' : 'App went in the background');
      }
    );

    watch(isIdle, async (val) => {
      // if logged go to page idle and wait unlock screen lockscreen save from router
      // else nothing
      if (val && isLogged.value && preferences.value && preferences.value.useIdle) {
        console.log(route);
        await router.push('/idle');
      }
    });

    watch(preferences, () => {
      if (preferences.value) {
        console.log('some changed', preferences.value.idleTimeout);
        idle.activityReportInSec = preferences.value.idleTimeout;
        idle.setTimer(preferences.value.idleTimeout * 1000);
      }
    });

    setInterval(() => {
      const DoIt = async () => {
        if (systemStore.onLine) {
          const { data, error } = await Users.Heartbeat();
          if (error) {
            authStore.clear();
          } else if (!authStore.isLogged) {
            console.log(data);
            authStore.get();
          }
        }
      };
      void DoIt();
    }, config.heartbeatTick * 1000);

    return {
      offLine: computed(() => !systemStore.onLine),
    };
  },
});
</script>
