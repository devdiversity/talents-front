<template>
  <q-dialog
    v-model="open"
    @hide="hide"
    @before-show="beforeShow"
    :maximized="$q.platform.is.mobile"
  >
    <q-card class="my-card" style="width: 500px;">
      <DialogToolbar title="userpassword.edit" :subTitle="userData?.email" />
      <q-card-section class="q-pa-md">
        <q-input
          label-color="primary"
          ref="registerPassword"
          v-model="password"
          :type="isPwd ? 'password' : 'text'"
          :label="$t('login.passwordlabel')"
        >
          <template v-slot:append>
            <q-icon
              class="cursor-pointer"
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
        <password-meter @score="onScore" :password="password" />
        <q-input
          label-color="primary"
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
      </q-card-section>

      <q-card-actions align="right">
        <q-btn :disable="!valid" color="primary" icon="save" @click="save"
          ><span class="q-ml-md">{{ $t('dialogs.save') }}</span></q-btn
        >
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  PropType,
  computed,
  onMounted,
  watch,
} from 'vue';

import PasswordMeter from 'src/components/PasswordMeter/PasswordMeter.vue';
import { passwordStrength } from 'src/components/PasswordMeter';
import { QInput, useQuasar } from 'quasar';
import DialogToolbar from 'components/DialogToolbar.vue';
import { Admin, User } from 'src/api/imported';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'ChangeUserPasswordDialog',
  components: {
    PasswordMeter,
    DialogToolbar,
  },
  props: {
    modelValue: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    userRow: {
      type: Object as PropType<User>,
      required: false,
      default: null,
    },
  },
  emits: ['update:modelValue', 'roles:saved'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const $q = useQuasar();
    const opened = ref(false);

    const registerPassword = ref<QInput>();
    const password = ref<string>('');
    const password2 = ref<string>('');
    const isPwd = ref<boolean>(true);
    const dialogPasswordInfo = ref<boolean>(false);

    const userData = ref<User>();

    onMounted(() => {
      registerPassword.value?.focus();
    });

    const beforeShow = () => {
      console.log('before show');
    };

    const open = computed({
      get: () => {
        return props.modelValue;
      },
      set: (value) => {
        emit('update:modelValue', value);
      },
    });

    watch(open, () => {
      if (!props.userRow) {
        userData.value = props.userRow;
      } else {
        userData.value = props.userRow;
      }
    });

    const valid = computed({
      get: () => {
        return score.value >= 3 && password.value == password2.value;
      },
      set: (value) => {
        emit('update:modelValue', value);
      },
    });

    const hide = () => {
      open.value = false;
    };

    const save = async () => {
      const { error } = await Admin.ChangeUserPassword({
        userUUID: userData.value?.uuid || '',
        password: password.value,
      });
      if (!error) {
        $q.notify({
          color: 'positive',
          textColor: 'white',
          icon: 'thumb_up_off_alt',
          message: t('password.dialog.updated'),
          position: 'top-right',
          timeout: 3000,
        });
        open.value = false;
      } else {
        $q.notify({
          color: 'negative',
          textColor: 'white',
          icon: 'thumb_down_off_alt',
          message: t('password.dialog.updateerror'),
          position: 'top-right',
          timeout: 3000,
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
      userData,
      opened,
      open,
      valid,
      registerPassword,
      password,
      password2,
      isPwd,
      dialogPasswordInfo,
      score,
      togglePassword,
      onScore,
      hide,
      save,
      beforeShow,
    };
  },
});
</script>
