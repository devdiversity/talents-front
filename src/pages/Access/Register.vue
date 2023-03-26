<template>
  <div>
    <q-card
      v-if="!complete"
      key="2"
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

      <q-card-section class="q-pb-none">
        <div class="row full-width items-end">
          <img
            class="q-mb-xs q-mr-sm icon-top"
            src="../../assets/register.svg"
          />
          <div class="col row text-h5">{{ $t('login.registeraccount') }}</div>
        </div>
        <div>
          <q-separator size="2px" color="primary" />
          <div class="col q-mt-sm">
            {{ $t('login.createaccount') }}
          </div>
        </div>
      </q-card-section>
      <q-card-section>
        <q-form class="q-gutter-md">
          <q-input
            ref="registerEmail"
            autofocus
            label-color="primary"
            outlined
            v-model="email"
            :label="$t('login.emaillabel')"
            lazy-rules
            :rules="[
              (val) =>
                val === '' ||
                validator.isEmail(val) ||
                $t('login.emailnotvalid'),
            ]"
          />
          <q-input
            label-color="primary"
            ref="registerPassword"
            outlined
            v-model="password"
            :type="isPwd ? 'password' : 'text'"
            :label="$t('login.passwordlabel')"
          >
            <template v-slot:append>
              <q-icon name="help_outline" @click="dialogPasswordInfo = true" />
              <q-dialog v-model="dialogPasswordInfo">
                <q-card class="bg-white">
                  <q-card-section class="row items-center q-pb-none">
                    <div class="text-h6">
                      {{ $t('login.passwordrequrements') }}
                    </div>
                    <q-space />
                    <q-btn icon="close" flat round dense v-close-popup />
                  </q-card-section>
                  <q-card-section class="text-bold text-red q-pb-none">
                    {{ $t('login.minrequirement') }}
                  </q-card-section>

                  <q-card-section class="q-pt-none">
                    <ul>
                      <li>{{ $t('login.passwordminlen') }}</li>
                      <li>{{ $t('login.passwordcases') }}</li>
                      <li>{{ $t('login.passwordalphanum') }}</li>
                      <li>{{ $t('login.passwordspecial') }}</li>
                    </ul>
                  </q-card-section>
                </q-card>
              </q-dialog>
            </template>
          </q-input>
          <password-meter @score="onScore" :password="password" />
          <q-input
            label-color="primary"
            outlined
            v-model="password2"
            :type="isPwd ? 'password' : 'text'"
            :label="$t('login.repeatpassword')"
            lazy-rules
            :rules="[(val) => val === password || $t('password.notsame')]"
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="togglePassword"
              />
            </template>
          </q-input>
          <div class="row items-center terms">
            <q-checkbox
              ref="registerTerms"
              color="primary"
              v-model="terms"
              :label="$t('login.acceptboth')"
            />
            <div class="q-mx-sm link">{{ $t('login.termsandconditions') }}</div>
            and
            <div class="q-ml-sm link">{{ $t('login.privacypolicy') }}</div>
          </div>
          <div>
            <q-btn
              class="full-width"
              :disabled="
                !validator.isEmail(email) ||
                !validator.isLength(password, { min: 6 }) ||
                password !== password2
              "
              unelevated
              :label="$t('login.buttonsignup')"
              type="submit"
              color="primary"
              @click.stop="doRegister"
            />
          </div>
        </q-form>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-separator class="q-mb-sm" size="2px" color="primary" />
        <div class="row justify-center">
          <div>{{ $t('login.allreadyaccount') }}</div>
          <div class="q-ml-sm link" @click="goToSignin()">
            {{ $t('login.gotosignin') }}
          </div>
        </div>
      </q-card-section>
    </q-card>
    <!-- -->
    <q-card
      v-if="complete"
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
          {{ $t('login.accountcreated') }}
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
.terms
  font-size: 80%
</style>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useQuasar, QCheckbox, QInput } from 'quasar';
import { useI18n } from 'vue-i18n';
import validator from 'validator';
import PasswordMeter from 'src/components/PasswordMeter/PasswordMeter.vue';
import { passwordStrength } from 'src/components/PasswordMeter';
import AuthBanner from 'src/APPLICATION/authBanner.vue';
import { Users } from 'src/api/imported';

export default defineComponent({
  name: 'RegisterUser',
  components: {
    PasswordMeter,
    AuthBanner,
  },
  emits: ['cmd', 'error'],
  setup(_, { emit }) {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { t } = useI18n();
    const $q = useQuasar();

    const email = ref<string>('');
    const password = ref<string>('');
    const password2 = ref<string>('');
    const terms = ref<boolean>(false);
    const isPwd = ref<boolean>(true);

    const dialogPasswordInfo = ref<boolean>(false);
    const registerEmail = ref<HTMLInputElement | null>(null);
    const registerTerms = ref<QCheckbox | null>(null);
    const registerPassword = ref<QInput | null>(null);

    const complete = ref<boolean>(false);

    const goToSignin = () => {
      emit('cmd', 'login');
    };

    const goToForgotPassword = () => {
      emit('cmd', 'forgotPassword');
    };

    const doRegister = async () => {
      if (score.value < 3) {
        $q.dialog({
          title: t('login.registererror'),
          message: t('login.errors.passwordweak'),
          cancel: false,
          persistent: true,
        }).onOk(() => {
          registerPassword.value?.focus();
        });
        return;
      }

      if (
        !validator.isEmail(email.value) ||
        !validator.isLength(password.value, { min: 6 }) ||
        password.value !== password2.value
      ) {
        $q.dialog({
          title: t('login.registererror'),
          message: t('login.errors.paswordnotsame'),
          cancel: false,
          persistent: true,
        }).onOk(() => {
          registerEmail.value?.focus();
          registerEmail.value?.select();
        });
        return;
      }
      if (!terms.value) {
        $q.dialog({
          title: t('login.registererror'),
          message: t('login.errors.noterms'),
          cancel: false,
          persistent: true,
        }).onOk(() => {
          (registerTerms.value?.$el as HTMLInputElement).focus();
        });
        return;
      }
      $q.loading.show({
        delay: 100, // ms
      });
      const { error } = await Users.Register({
        email: email.value,
        password: password.value,
      });
      $q.loading.hide();
      if (!error) {
        complete.value = true;
      } else {
        $q.dialog({
          title: t('login.registererror'),
          message: t(error.text),
          cancel: false,
          persistent: true,
        }).onOk(() => {
          registerEmail.value?.focus();
        });
      }
    };

    const togglePassword = () => {
      isPwd.value = !isPwd.value;
    };

    const score = ref<number>(0);

    const onScore = (payload: passwordStrength) => {
      score.value = payload.score;
    };

    return {
      email,
      password,
      password2,
      terms,
      isPwd,
      goToSignin,
      goToForgotPassword,
      doRegister,
      togglePassword,
      validator: validator,
      onScore,
      score,
      dialogPasswordInfo,
      registerPassword,
      registerEmail,
      registerTerms,
      complete,
    };
  },
});
</script>
