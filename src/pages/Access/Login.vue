<template>
  <q-page class="row items-center justify-evenly">
    <q-card key="1" v-bind:style="$q.screen.lt.sm ? { width: '100%', 'margin-top': '40px' } : { 'min-width': '380px' }" flat>
      <q-card-section class="q-pb-none">
        <AuthBanner />
      </q-card-section>
      <q-card-section class="q-pb-none">
        <div class="row full-width items-end">
          <img class="q-mb-xs q-mr-sm icon-top" src="../../assets/padlock.svg" />
          <div class="col row text-h6">{{ $t('login.login') }}</div>
          <q-toggle v-model="autofill" color="primary" :label="$t('login.autofill')" left-label />
        </div>
        <div>
          <q-separator size="2px" />
        </div>
      </q-card-section>
      <q-card-section>
        <q-form class="q-gutter-md">
          <div v-if="autofill">
            <q-input class="q-mb-sm" autofocus label-color="primary" outlined v-model="email" name="email" type="email" :label="$t('login.emaillabel')" lazy-rules />
            <q-input class="q-mt-sm" label-color="primary" outlined v-model="password" name="password" type="password" :label="$t('login.passwordlabel')" lazy-rules />
          </div>
          <div v-else>
            <q-input class="q-mb-sm" autofocus label-color="primary" outlined v-model="email" type="text" :label="$t('login.emaillabel')" lazy-rules />
            <q-input input-class="input-dotted" class="q-mt-sm" label-color="primary" outlined v-model="password" type="text" :label="$t('login.passwordlabel')" lazy-rules />
          </div>
          <div>
            <q-btn class="full-width" unelevated :label="$t('login.login')" type="submit" color="primary" @click.prevent="doLogin" />
          </div>
        </q-form>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-separator class="q-mb-sm" size="2px" color="primary" />
        <div class="text-center">
          <div class="row justify-center col q-mb-sm">
            {{ $t('login.noaccount') }}
            <div class="q-ml-sm link" @click="goToSignup()">
              {{ $t('login.signup') }}
            </div>
          </div>
          <div class="q-ml-sm link" @click="goToForgotPassword()">
            {{ $t('login.forgotpassword') }}
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<style lang="sass" scoped>
.link
  color: $primary
  cursor: pointer
  font-weight: bold
.link:hover
  text-decoration: underline
.q-card
  background-color: transparent
.text-h5
  margin-bottom: 4px
.icon-top
  max-width: 40px
  top: -4px
</style>

<style lang="sass">
.input-dotted
  -webkit-text-security: disc
  -moz-text-security: disc
  text-security: disc
</style>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import AuthBanner from 'src/APPLICATION/authBanner.vue';
import { Users } from 'src/api/imported';
import { useAuthStore } from 'stores/auth';

export default defineComponent({
  name: 'LoginToAccount',
  components: {
    AuthBanner,
  },
  emits: ['cmd', 'error'],
  setup(_, { emit }) {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { t } = useI18n();
    const $q = useQuasar();
    const router = useRouter();
    const email = ref<string>();
    const password = ref<string>();
    const auth = useAuthStore();
    const autofill = ref(false);

    if (auth.isLogged) {
      $q.dialog({
        title: t('login.alreadytitle'),
        message: t('login.already'),
        persistent: true,
      }).onOk(async () => {
        await router.push('/');
      });
    }

    const goToSignup = () => {
      emit('cmd', 'register');
    };

    const goToForgotPassword = () => {
      emit('cmd', 'forgotPassword');
    };

    const doLogin = async () => {
      $q.loading.show({
        delay: 100, // ms
      });
      const { error } = await Users.LoginToAccount({
        email: email.value || '',
        password: password.value || '',
      });
      $q.loading.hide();
      if (error) {
        $q.dialog({
          title: 'Error',
          message: t(error.text),
          persistent: true,
        });
      }
      await auth.get();
      $q.loading.hide();
      await router.push('/');
      return;
    };

    return {
      email,
      password,
      goToSignup,
      goToForgotPassword,
      doLogin,
      auth,
      autofill,
    };
  },
});
</script>
