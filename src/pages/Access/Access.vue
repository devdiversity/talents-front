<template>
  <q-page class="row fit justify-center items-center">
    <keep-alive>
      <component :is="section" @cmd="doCmd" @error="doError" />
    </keep-alive>
  </q-page>

  <q-dialog v-model="showError" persistent>
    <q-card class="bg-white" style="min-width: 250px;">
      <q-card-section class="row items-start q-pb-none">
        <div class="row items-end">
          <img class="icon-top q-mr-md" src="../../assets/error.svg" />
          <div class="text-h6 text-red-9">{{ $t('login.error') }}</div>
        </div>
        <q-space />
        <q-btn class="q-ml-md" icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-separator class="q-mx-sm" size="2px" color="negative" />
      <q-card-section>
        <div class="text-red-9">
          <b>{{ $t(errorMessage) }}</b>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<style lang="sass" scoped>
.icon-top
  max-width: 80px
  top: 0px
</style>
<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import login from './Login.vue';
import register from './Register.vue';
import forgotPassword from './ForgotPassword.vue';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'stores/auth';

export default defineComponent({
  name: 'AccesssPage',
  components: {
    login,
    register,
    forgotPassword,
  },
  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const showError = ref<boolean>(false);
    const errorMessage = ref<string>('noerror');
    const section = ref<string>('login');
    const auth = useAuthStore();

    const doCmd = (cmd: string) => {
      section.value = cmd;
    };

    const doError = (error: string) => {
      return new Promise((resolve) => {
        $q.dialog({
          title: 'Error',
          message: error,
          persistent: true,
        }).onOk(() => {
          resolve('OK');
        });
      });
    };

    onMounted(async () => {
      if (auth.isLogged) {
        await router.push('/');
      }
    });

    return {
      section,
      doCmd,
      showError,
      errorMessage,
      doError,
    };
  },
});
</script>

<style></style>
