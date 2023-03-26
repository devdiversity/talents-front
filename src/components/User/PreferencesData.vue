<template>
  <div class="column">
    <div class="text-h6">{{ $t('profile.preferences.title') }}</div>
    <q-separator />
    <q-form
      class="q-gutter-md"
      autocorrect="off"
      autocapitalize="off"
      autocomplete="off"
      spellcheck="false"
    >
      <div class="row q-py-sm">
        <q-btn
          v-if="!onEdit"
          class="q-mr-sm"
          dense
          style="min-width: 60px;"
          color="primary"
          icon="edit"
          @click="onEdit = !onEdit"
          ><span class="q-mx-sm">{{
            $t('profile.preferences.edit')
          }}</span></q-btn
        >
        <q-btn
          v-if="onEdit"
          dense
          style="min-width: 60px;"
          color="primary"
          icon="save"
          @click="save"
          ><span class="q-mx-sm">{{
            $t('profile.preferences.save')
          }}</span></q-btn
        >

        <q-btn
          class="q-ml-md"
          v-if="onEdit"
          dense
          flat
          style="min-width: 60px;"
          color="primary"
          @click="reset()"
          ><span class="q-mx-sm">{{
            $t('profile.preferences.reset')
          }}</span></q-btn
        >
      </div>
      <div class="column">
        <div class="row q-py-sm">
          <q-btn
            :disable="!onEdit"
            class="q-px-md"
            dense
            color="primary"
            :label="preferences.language != '' ? preferences.language : 'En'"
          >
            <LangSelectorMenu v-model="preferences.language" />
          </q-btn>
        </div>
        <div v-if="config.useIdle">
          <q-toggle
            :disable="!onEdit"
            v-model="preferences.useIdle"
            icon="alarm"
            :label="$t('preferences.idleenabled')"
          />

          <q-select
            class="q-mx-sm"
            :disable="!preferences.useIdle || !onEdit"
            v-model="idletimeout"
            :options="idleOptions"
            :label="$t('preferences.idletimeout')"
          />

          <q-toggle
            :disable="!preferences.useIdle || !onEdit"
            v-model="preferences.useIdlePassword"
            icon="key"
            :label="$t('preferences.useidlepassword')"
          />
          <div class="q-mx-sm">
            <q-input
              ref="idlePinRef"
              :type="hidePassword ? 'password' : 'text'"
              :disable="
                !preferences.useIdle || !onEdit || !preferences.useIdlePassword
              "
              v-model="preferences.idlePin"
              :label="$t('preferences.idlepin')"
              stack-label
              :rules="[(val) => val.length >= 4 || $t('preferences.nin4char')]"
              lazy-rules
              @blur="hidePassword = true"
            >
              <template v-slot:append>
                <q-icon
                  :name="hidePassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="hidePassword = !hidePassword"
                />
              </template>
            </q-input>
          </div>
          <div class="q-mt-md" />
        </div>
        <q-toggle
          class="q-mt-md"
          :disable="!onEdit"
          v-model="preferences.useDirectLogin"
          icon="adjust"
          :label="$t('preferences.usedirectlogin')"
        />

        <q-toggle
          :disable="!onEdit"
          v-model="preferences.useQuadcodeLogin"
          icon="qr_code"
          :label="$t('preferences.usequadcodelogin')"
        />

        <q-toggle
          :disable="!onEdit"
          v-model="preferences.sendNoticesMail"
          icon="attach_email"
          :label="$t('preferences.sendnoticesmail')"
        />
      </div>
    </q-form>
  </div>
</template>

<script lang="ts">
// import ExampleComponent from 'components/CompositionComponent.vue';
import { defineComponent, ref, onMounted, PropType, reactive } from 'vue';
import { QForm, QInput, useQuasar } from 'quasar';
import { Admin, Preferences, User, Users } from 'src/api/imported';
import { useAuthStore } from 'stores/auth';
import { useSystemStore } from 'stores/system';
import { useI18n } from 'vue-i18n';
import useConfig from 'src/config/useConfig';
import LangSelectorMenu from 'src/components/User/LangSelectorMenu.vue';

interface idleTimeoutOption {
  label: string;
  value: number;
}

export default defineComponent({
  name: 'PreferencesData',
  components: { QForm, LangSelectorMenu },
  props: {
    userRow: {
      type: Object as PropType<User>,
      required: false,
      default: null,
    },
  },
  emits: ['update'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const $q = useQuasar();
    const auth = useAuthStore();
    const system = useSystemStore();
    const config = useConfig();
    const onEdit = ref(false);
    const idlePinRef = ref<QInput>();
    const hidePassword = ref(true);

    const preferences = reactive<Preferences>(auth.preferences as Preferences);

    const idleOptions: idleTimeoutOption[] = <idleTimeoutOption[]>[
      {
        label: '10 seconds',
        value: 10,
      },
      {
        label: '30 seconds',
        value: 30,
      },
      {
        label: '1 minute',
        value: 60,
      },
      {
        label: '5 minutes',
        value: 300,
      },
      {
        label: '10 minutes',
        value: 600,
      },
      {
        label: '30 minutes',
        value: 1800,
      },
    ];

    const idletimeout = ref<idleTimeoutOption | undefined>(idleOptions[4]);

    const userData = ref<User>();

    onMounted(() => {
      if (!props.userRow) {
        userData.value = auth.user as User;
      } else {
        userData.value = props.userRow;
      }
      reset();
    });

    const reset = () => {
      let p: Preferences;
      if (userData.value && userData.value.preferences) {
        p = userData.value.preferences;
      } else {
        p = <Preferences>{
          useIdle: false,
          idleTimeout: 600,
          useIdlePassword: false,
          idlePin: '',
          useDirectLogin: false,
          useQuadcodeLogin: false,
          sendNoticesMail: false,
        };
      }

      idletimeout.value = idleOptions.find((v) => {
        if (v.value == p.idleTimeout) return true;
      });

      Object.assign(preferences, p);

      onEdit.value = false;
    };

    const save = async () => {
      if (config.useIdle && !(await idlePinRef.value?.validate())) return;
      preferences.idleTimeout = idletimeout.value?.value || 10;

      let uuid = '';
      if (!props.userRow) {
        uuid = userData.value?.uuid || '';
      }
      if (auth.user?.uuid !== props.userRow.uuid) {
        const { data, error } = await Admin.UpdateUserPreferences({
          uuid: props.userRow.uuid,
          preferences: preferences,
        });

        if (!error) {
          emit('update', data);
          $q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'thumb_up_off_alt',
            message: t('profile.preferences.updatesuccess'),
            position: 'top-right',
            timeout: 3000,
          });
          onEdit.value = false;
          await auth.get();
        } else {
          $q.notify({
            color: 'negative',
            textColor: 'white',
            icon: 'thumb_down_off_alt',
            message: t('profile.preferences.updateerror'),
            position: 'top-right',
            timeout: 3000,
          });
        }
      }

      if (auth.user?.uuid == props.userRow.uuid) {
        const { data, error } = await Users.UpdatePreferences({
          uuid: uuid,
          preferences: preferences,
        });

        if (!error) {
          emit('update', data);
          $q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'thumb_up_off_alt',
            message: t('profile.preferences.updatesuccess'),
            position: 'top-right',
            timeout: 3000,
          });
          onEdit.value = false;
          await auth.get();
        } else {
          $q.notify({
            color: 'negative',
            textColor: 'white',
            icon: 'thumb_down_off_alt',
            message: t('profile.preferences.updateerror'),
            position: 'top-right',
            timeout: 3000,
          });
        }
      }
    };
    return {
      system,
      config,
      onEdit,
      idlePinRef,
      idletimeout,
      idleOptions,
      preferences,
      hidePassword,
      reset,
      save,
    };
  },
});
</script>
