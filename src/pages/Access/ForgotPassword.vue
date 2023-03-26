<template>
  <div>
    <q-card
      v-if="!ready"
      v-bind:style="
        $q.screen.lt.sm
          ? { width: '100%', 'margin-top': '40px' }
          : { 'min-width': '380px' }
      "
      flat
    >
      <q-card-section class="q-pb-none">
        <AuthBanner />
      </q-card-section>

      <q-card-section>
        <div class="row full-width items-end">
          <img
            class="q-mb-xs q-mr-sm icon-top"
            src="../../assets/resendPassword.svg"
          />
          <div class="col row text-h5">
            {{ $t('login.forgotpasswordtitle') }}
          </div>
        </div>
        <div>
          <q-separator size="2px" color="primary" />
          <div class="col q-mt-sm">{{ $t('login.forgotpasswordinfo') }}</div>
        </div>
      </q-card-section>

      <q-card-section>
        <q-form class="q-gutter-md">
          <q-input
            autofocus
            ref="recoverEmail"
            label-color="primary"
            no-error-icon
            outlined
            v-model="email"
            :label="$t('login.emaillabel')"
            :lazy-rules="'ondemand'"
            :rules="[
              (val) => !!val || $t('login.errors.emailismissing'),
              (val) =>
                validator.isEmail(val) || $t('login.errors.emailnotvalid'),
            ]"
            @focus="gotFocus"
          />
          <div>
            <q-btn
              class="full-width"
              unelevated
              :label="$t('login.sendrecoverlink')"
              type="submit"
              color="primary"
              @click.stop="doRecover"
            />
          </div>
        </q-form>
      </q-card-section>
      <div class="q-px-md">
        <q-separator size="2px" color="primary" />
      </div>
      <q-card-section>
        <div class="text-center">
          <div class="q-ml-sm link" @click="goToSignin()">
            {{ $t('login.gobacktosignin') }}
          </div>
        </div>
      </q-card-section>
    </q-card>
    <!--- ---------- -->
    <q-card
      v-if="ready"
      v-bind:style="
        $q.screen.lt.sm
          ? { width: '100%', 'margin-top': '40px' }
          : { 'min-width': '380px' }
      "
      flat
    >
      <q-card-section>
        <img class="absolute-center icon-top" src="../../assets/email.svg" />
      </q-card-section>
      <q-card-section>
        <div class="text-center q-py-md">
          <div class="col text-h5">{{ $t('appTitle') }}</div>
        </div>
      </q-card-section>
      <div class="q-px-md">
        <q-separator size="2px" color="primary" />
      </div>
      <q-card-section> </q-card-section>
      <div class="q-px-md text-center text-bold">
        <div class="col">
          {{ $t('login.recoverready') }}
        </div>
      </div>
      <div class="q-px-md q-mt-xl text-center text-bold">
        <div class="col">{{ $t('login.checkemail') }}</div>
      </div>
      <q-card-section> </q-card-section>
      <div class="q-px-md">
        <q-separator size="2px" color="primary" />
      </div>
    </q-card>
  </div>
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

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import validator from 'validator';
import { useI18n } from 'vue-i18n';
import { useQuasar, QInput } from 'quasar';
import AuthBanner from 'src/APPLICATION/authBanner.vue';
import { Users } from 'src/api/imported';

export default defineComponent({
  name: 'ForgotPassword',
  components: {
    AuthBanner,
  },
  emits: ['cmd', 'error'],
  setup(_, { emit }) {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { t } = useI18n();
    const $q = useQuasar();
    const email = ref<string>('');
    const recoverEmail = ref<HTMLInputElement | null>(null);
    const ready = ref<boolean>(false);

    onMounted(() => {
      ready.value = false;
    });

    const goToSignin = () => {
      emit('cmd', 'login');
    };

    const gotFocus = () => {
      ((recoverEmail.value as unknown) as QInput)?.resetValidation();
    };

    const doRecover = async () => {
      $q.loading.show({
        delay: 100, // ms
      });

      if (!validator.isEmail(email.value)) {
        $q.loading.hide();
        $q.dialog({
          title: t('login.recoverpassworderror'),
          message: t('login.recoverpasswordwrong'),
          cancel: false,
          persistent: true,
        }).onOk(() => {
          ((recoverEmail.value as unknown) as QInput)?.resetValidation();
          recoverEmail.value?.focus();
          recoverEmail.value?.select();
        });
        return;
      }
      const { error } = await Users.ForgotAccountPassword({
        email: email.value,
        browser: 'unknown',
        operatingSystem: 'unknown',
      });
      $q.loading.hide();
      if (!error) {
        ready.value = true;
      } else {
        $q.dialog({
          title: t('login.recoverpassworderror'),
          message: t(error.text),
          cancel: false,
          persistent: true,
        }).onOk(() => {
          recoverEmail.value?.focus();
          recoverEmail.value?.select();
        });
      }
    };

    return {
      ready,
      email,
      recoverEmail,
      doRecover,
      goToSignin,
      gotFocus,
      validator: validator,
    };
  },
});
</script>
