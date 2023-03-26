<template>
  <q-page class="row fit justify-center items-center">
    <q-card
      v-bind:style="
        $q.screen.lt.sm
          ? { width: '100%', 'margin-top': '40px' }
          : { 'min-width': '380px' }
      "
      flat
    >
      <q-card-section>
        <img class="absolute-center icon-top" src="../../assets/verify.svg" />
      </q-card-section>
      <q-card-section>
        <div class="text-center q-py-md">
          <div class="col text-h5">{{ $t('login.verifyrecovertoken') }}</div>
        </div>
      </q-card-section>
      <div>
        <div class="q-px-md">
          <q-separator size="2px" color="primary" />
        </div>

        <q-card-section v-if="verified">
          <div class="q-px-md text-center text-bold">
            <div class="col-12">
              <div class="q-mb-md">
                {{ $t('login.recovertokenvalid') }}
              </div>
              <q-input
                label-color="primary"
                ref="registerPassword"
                outlined
                v-model="password"
                :type="isPwd ? 'password' : 'text'"
                :label="$t('login.passwordlabel')"
              >
                <template v-slot:append>
                  <q-icon
                    name="help_outline"
                    @click="dialogPasswordInfo = true"
                  />
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
              <password-meter
                class="q-mb-md"
                @score="onScore"
                :password="password"
              />
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
            </div>
            <div class="col-12 q-mt-md">
              <q-btn
                class="q-mr-md"
                color="primary"
                :disabled="
                  password == '' ||
                  password.length < 6 ||
                  password !== password2
                "
                @click.stop="savePassword"
                >{{ $t('login.savepassword') }}</q-btn
              >
            </div>
          </div>
        </q-card-section>

        <div class="q-px-md">
          <q-separator size="2px" color="primary" />
        </div>
      </div>
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
  max-width: 80px
  top: 0px
</style>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useRoute } from 'vue-router';
import { useQuasar, QInput } from 'quasar';
import { useI18n } from 'vue-i18n';
import PasswordMeter from 'src/components/PasswordMeter/PasswordMeter.vue';
import { passwordStrength } from 'src/components/PasswordMeter';
import validator from 'validator';
import { useAuthStore } from 'stores/auth';
import { Users } from 'src/api/imported';

export default defineComponent({
  name: 'RecoverPasswordToken',
  components: {
    PasswordMeter,
  },
  setup() {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { t } = useI18n();
    const auth = useAuthStore();
    const route = useRoute();
    const router = useRouter();
    const verified = ref<boolean>(false);
    const token = ref<string>('');

    const password = ref<string>('');
    const password2 = ref<string>('');
    const isPwd = ref<boolean>(true);

    const dialogPasswordInfo = ref<boolean>(false);
    const registerPassword = ref<QInput | null>(null);

    const $q = useQuasar();

    if (auth.isLogged) {
      $q.dialog({
        title: t('login.tokenverify'),
        message: t('login.allreadyloggedin'),
        cancel: false,
        persistent: true,
      }).onOk(() => {
        void router.push('/');
      });
    } else {
      token.value = (route.params.token as string) || '';
      if (token.value) {
        const loadingMessage = t('login.tokenverify');
        $q.loading.show({
          message: loadingMessage,
          boxClass: 'bg-grey-2 text-grey-9',
          spinnerColor: 'primary',
        });
        setTimeout(async () => {
          const { error } = await Users.TokenVerification(token.value);
          $q.loading.hide();
          if (!error) {
            await auth.get();
            verified.value = true;
          } else {
            verified.value = false;
            $q.dialog({
              title: t('login.tokenerror'),
              message: t(error.text),
              cancel: false,
              persistent: true,
            }).onOk(() => {
              void router.push('/');
            });
          }
        });
      } else {
        $q.dialog({
          title: t('login.tokenerror'),
          message: t('login.tokennotfound'),
          cancel: false,
          persistent: true,
        }).onOk(() => {
          void router.push('/');
        });
      }
    }

    const togglePassword = () => {
      isPwd.value = !isPwd.value;
    };

    const score = ref<number>(0);

    const onScore = (payload: passwordStrength) => {
      score.value = payload.score;
    };

    const validatePassword = (): boolean => {
      if (score.value < 3) {
        $q.dialog({
          title: t('login.resetpassword'),
          message: t('login.password.weak'),
          cancel: false,
          persistent: true,
        }).onOk(() => {
          registerPassword.value?.focus();
        });
        return false;
      }

      if (
        !validator.isLength(password.value, { min: 6 }) ||
        password.value !== password2.value
      ) {
        $q.dialog({
          title: t('login.resetpassword'),
          message: t('login.password.notsame'),
          cancel: false,
          persistent: true,
        }).onOk(() => {
          registerPassword.value?.focus();
        });
        return false;
      }
      return true;
    };

    const savePassword = async () => {
      if (validatePassword()) {
        $q.loading.show();
        const { error } = await Users.ChangeUserPassword({
          token: token.value,
          password: password.value,
        });
        $q.loading.hide();
        if (!error) {
          await router.push('/');
        } else {
          $q.dialog({
            title: t('login.resetpassword'),
            message: t(error.text),
            cancel: false,
            persistent: true,
          }).onOk(() => {
            registerPassword.value?.focus();
          });
        }
      }
    };

    return {
      token,
      verified,
      password,
      password2,
      isPwd,
      dialogPasswordInfo,
      registerPassword,
      auth,
      togglePassword,
      onScore,
      savePassword,
    };
  },
});
</script>
