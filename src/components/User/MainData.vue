<template>
  <div class="column">
    <div class="text-h6">{{ $t('profile.maindata.title') }}</div>
    <q-separator />
    <q-form class="q-gutter-md" autocorrect="off" autocapitalize="off" autocomplete="off" spellcheck="false">
      <div class="row q-py-sm">
        <q-btn
          v-if="!onEdit"
          class="q-mr-sm"
          dense
          style="min-width: 60px"
          color="primary"
          icon="edit"
          @click="
            onEdit = !onEdit;
            start();
          "
          ><span class="q-mx-sm">{{ $t('profile.maindata.edit') }}</span></q-btn
        >
        <q-btn v-if="onEdit" dense style="min-width: 60px" color="primary" icon="save" @click="onSave"
          ><span class="q-mx-sm">{{ $t('profile.maindata.save') }}</span></q-btn
        >

        <q-btn class="q-ml-md" v-if="onEdit" dense flat style="min-width: 60px" color="primary" @click="reset()"
          ><span class="q-mx-sm">{{ $t('profile.maindata.reset') }}</span></q-btn
        >
      </div>

      <q-input
        ref="nicknameRef"
        v-model="form.nickname"
        :label="$t('profile.maindata.nickname')"
        :disable="!onEdit"
        debounce="500"
        stack-label
        :rules="[(val) => val.length >= 2 || $t('profile.maindata.nin2char'), requiredRule]"
        lazy-rules
        :dense="!$q.platform.is.desktop"
        hide-bottom-space
      />
      <div class="q-pl-md row full-width">
        <div style="min-width: 100px">
          <q-select
            class="q-pr-md"
            ref="titleSelectRef"
            v-model="titleSelect"
            :options="titleOptions"
            :disable="!onEdit"
            :label="$t('profile.maindata.usertitle')"
            stack-label
            :rules="[(val) => !!val || $t('profile.maindata.required')]"
            lazy-rules
            @change="selected"
            :dense="!$q.platform.is.desktop"
            hide-bottom-space
          />
        </div>
        <div style="flex: 1">
          <q-input
            v-if="titleSelect == otherTitle"
            ref="titleRef"
            v-model="form.title"
            autofocus
            :label="$t('profile.maindata.othertitle')"
            stack-label
            :disable="!onEdit"
            :rules="[(val) => !!val || $t('profile.maindata.required')]"
            lazy-rules
            :dense="!$q.platform.is.desktop"
            hide-bottom-space
          />
        </div>
      </div>
      <q-input
        ref="firstnameRef"
        v-model="form.firstname"
        :label="$t('profile.maindata.firstname')"
        :disable="!onEdit"
        stack-label
        :rules="[(val) => !!val || $t('profile.maindata.required')]"
        lazy-rules
        :dense="!$q.platform.is.desktop"
        hide-bottom-space
      />
      <q-input
        ref="lastnameRef"
        v-model="form.lastname"
        :label="$t('profile.maindata.lastname')"
        :disable="!onEdit"
        stack-label
        :rules="[(val) => !!val || $t('profile.maindata.required')]"
        lazy-rules
        :dense="!$q.platform.is.desktop"
        hide-bottom-space
      />
    </q-form>
  </div>
</template>

<script lang="ts">
// import ExampleComponent from 'components/CompositionComponent.vue';
import { defineComponent, ref, onMounted, PropType, reactive } from 'vue';
import { QInput, QForm, QSelect, useQuasar } from 'quasar';
import { useAuthStore } from 'stores/auth';
import { Admin, NicknameCheckForm, User, UserContactsForm, UserProfile, Users } from 'src/api/imported';
import { useI18n } from 'vue-i18n';

interface mainContactsData {
  title: string;
  nickname: string;
  firstname: string;
  lastname: string;
}

export default defineComponent({
  name: 'MainData',
  components: { QForm },
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
    const showError = ref<boolean>(false);
    const errorMessage = ref<string>('');

    const form = reactive(<mainContactsData>{
      title: '',
      nickname: '',
      firstname: '',
      lastname: '',
    });

    const text = ref('');
    const onEdit = ref(false);
    const nicknameRef = ref<QInput>();
    const titleSelectRef = ref<QSelect>();
    const titleRef = ref<QInput>();
    const firstnameRef = ref<QInput>();
    const lastnameRef = ref<QInput>();
    const otherTitle = ref('');

    const getTitleOptions = (): string[] => {
      const o = t('profile.maindata.titles');
      const a = o.split(':');
      if (!a.length || a[0] === 'profile.maindata.titles') {
        otherTitle.value = 'Other';
        return ['Mr', 'Mrs', 'Ms', 'Miss', 'Other'];
      }
      otherTitle.value = a.pop() || '?';
      return a;
    };
    const titleSelect = ref('');
    const titleOptions = ref(getTitleOptions());
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
      if (userData.value?.profile) {
        form.nickname = userData?.value?.profile?.nickname || '';
        //title.value = userData?.value?.profile?.title || '';
        form.firstname = userData?.value?.profile?.firstname || '';
        form.lastname = userData?.value?.profile?.lastname || '';
        form.title = userData?.value?.profile?.title || '';

        if (titleOptions.value.includes(form.title) || !form.title) {
          titleSelect.value = form.title;
        } else {
          titleSelect.value = otherTitle.value;
        }
      }
      nicknameRef.value?.resetValidation();
      titleRef.value?.resetValidation();
      titleSelectRef.value?.resetValidation();
      firstnameRef.value?.resetValidation();
      lastnameRef.value?.resetValidation();
      onEdit.value = false;
    };

    const onSave = async () => {
      if (!(await nicknameRef.value?.validate())) return;
      if (!(await titleSelectRef.value?.validate())) return;

      let _title = titleSelect.value;
      if (titleSelect.value == otherTitle.value) {
        if (!(await titleRef.value?.validate())) return;
        _title = form.title;
      }

      if (!(await lastnameRef.value?.validate())) return;

      const userContacts = userData.value?.profile || <UserProfile>{};

      userContacts.title = _title;
      userContacts.nickname = form.nickname;
      userContacts.firstname = form.firstname;
      userContacts.lastname = form.lastname;

      const userContactsForm = Object.assign(<UserContactsForm>{}, userContacts);
      userContactsForm.userUUID = userData.value?.uuid || '';

      if (auth.user?.uuid !== props.userRow.uuid) {
        const { data, error } = await Admin.UpdateUserContacts(userContactsForm);
        if (!error) {
          emit('update', data);
          $q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'thumb_up_off_alt',
            message: t('profile.maindata..maindatasuccessfully'),
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
            message: t('profile.maindata..maindataerror'),
            position: 'top-right',
            timeout: 3000,
          });
        }
      }

      if (auth.user?.uuid == props.userRow.uuid) {
        userContactsForm.userUUID = props.userRow.uuid;
        const { data, error } = await Users.UpdateContacts(userContactsForm);
        if (!error) {
          emit('update', data);
          $q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'thumb_up_off_alt',
            message: t('profile.maindata..maindatasuccessfully'),
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
            message: t('profile.maindata..maindataerror'),
            position: 'top-right',
            timeout: 3000,
          });
        }
      }
    };

    const requiredRule = async (val: string) => {
      if (props.userRow.profile.nickname == val) {
        return true;
      }
      const { error } = await Users.NicknameExist(<NicknameCheckForm>{
        userId: auth.user?.uuid || '',
        nickname: val,
      });
      if (!error) return true;
      return t('profile.maindata.nicknamebusy');
    };

    return {
      showError,
      errorMessage,
      requiredRule,
      text,
      onEdit,
      nicknameRef,
      titleSelectRef,
      titleRef,
      firstnameRef,
      lastnameRef,
      titleSelect,
      titleOptions,
      otherTitle,
      form,

      reset,
      onSave,
      selected() {
        if (titleSelect.value === 'Other') {
          setTimeout(() => {
            titleRef?.value?.focus();
          }, 200);
        }
      },
      start() {
        setTimeout(() => {
          nicknameRef?.value?.focus();
        }, 20);
      },
    };
  },
});
</script>
