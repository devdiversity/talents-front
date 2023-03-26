<template>
  <div class="column">
    <div class="text-h6">{{ $t('profile.contacts.title') }}</div>
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
          @click="
            onEdit = !onEdit;
            start();
          "
          ><span class="q-mx-sm">{{ $t('profile.contacts.edit') }}</span></q-btn
        >
        <q-btn
          v-if="onEdit"
          dense
          style="min-width: 60px;"
          color="primary"
          icon="save"
          @click="onSave"
          ><span class="q-mx-sm">{{ $t('profile.contacts.save') }}</span></q-btn
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
            $t('profile.contacts.reset')
          }}</span></q-btn
        >
      </div>
      <div class="q-mb-md">
        <q-input
          ref="phoneNumberRef"
          v-model="phoneNumber"
          :label="$t('profile.contacts.phonenumber')"
          :disable="!onEdit"
          debounce="500"
          lazy-rules
          stack-label
          :dense="!$q.platform.is.desktop"
        />
      </div>
      <div class="q-mb-md">
        <q-input
          ref="mobileNumberRef"
          v-model="mobileNumber"
          :label="$t('profile.contacts.mobilenumber')"
          :disable="!onEdit"
          lazy-rules
          stack-label
          :dense="!$q.platform.is.desktop"
        />
      </div>

      <q-input
        ref="address1Ref"
        v-model="address1"
        :label="$t('profile.contacts.address')"
        :disable="!onEdit"
        stack-label
        :rules="[(val) => !!val || $t('profile.contacts.required')]"
        lazy-rules
        :dense="!$q.platform.is.desktop"
        hide-bottom-space
      />

      <q-input
        ref="address2Ref"
        v-model="address2"
        :label="$t('profile.contacts.moreaddress')"
        :disable="!onEdit"
        stack-label
        :dense="!$q.platform.is.desktop"
        hide-bottom-space
      />

      <q-input
        ref="zipRef"
        v-model="zip"
        :label="$t('profile.contacts.zipcode')"
        :disable="!onEdit"
        stack-label
        :rules="[(val) => !!val || $t('profile.contacts.required')]"
        lazy-rules
        :dense="!$q.platform.is.desktop"
        hide-bottom-space
      />

      <q-input
        ref="cityRef"
        v-model="city"
        :label="$t('profile.contacts.city')"
        :disable="!onEdit"
        stack-label
        :rules="[(val) => !!val || $t('profile.contacts.required')]"
        lazy-rules
        :dense="!$q.platform.is.desktop"
        hide-bottom-space
      />

      <q-select
        ref="countryRef"
        v-model="country"
        :disable="!onEdit"
        :label="$t('profile.contacts.country')"
        stack-label
        :rules="[(val) => !!val || $t('profile.contacts.required')]"
        lazy-rules
        use-input
        hide-selected
        fill-input
        input-debounce="0"
        :options="countyOptions"
        @filter="filterFn"
        :dense="!$q.platform.is.desktop"
        hide-bottom-space
      />
    </q-form>
  </div>
</template>

<script lang="ts">
// import ExampleComponent from 'components/CompositionComponent.vue';
import { defineComponent, ref, onMounted, PropType } from 'vue';
import { QInput, QForm, QSelect, useQuasar } from 'quasar';
import { countries } from 'src/config/countries';
import { Users, User, UserContactsForm, Admin } from 'src/api/imported';
import { useAuthStore } from 'stores/auth';
import { useI18n } from 'vue-i18n';

type Callback = () => void;
interface CountryOption {
  value: string;
  label: string;
}

export default defineComponent({
  name: 'ContactsData',
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

    const onEdit = ref(false);

    const phoneNumberRef = ref<QInput>();
    const mobileNumberRef = ref<QInput>();
    const address1Ref = ref<QInput>();
    const address2Ref = ref<QInput>();
    const zipRef = ref<QInput>();
    const cityRef = ref<QInput>();
    const countryRef = ref<QSelect>();

    const phoneNumber = ref('');
    const mobileNumber = ref('');
    const address1 = ref('');
    const address2 = ref('');
    const zip = ref('');
    const city = ref('');
    const country = ref<CountryOption>();

    const countyOptions = ref<CountryOption[]>(countries);

    const userData = ref<User>();

    onMounted(() => {
      if (!props.userRow) {
        userData.value = auth.user as User;
      } else {
        userData.value = props.userRow;
      }
      reset();
    });

    const getOption = (country: string): CountryOption | undefined => {
      const found = countries.find((element) => element.value == country);
      return found;
    };

    const reset = () => {
      if (userData.value?.profile) {
        phoneNumber.value = userData?.value?.profile?.phoneNumber || '';
        mobileNumber.value = userData?.value?.profile?.mobileNumber || '';
        address1.value = userData?.value?.profile?.address1 || '';
        address2.value = userData?.value?.profile?.address2 || '';
        zip.value = userData?.value?.profile?.zip || '';
        city.value = userData?.value?.profile?.city || '';
        country.value = getOption(userData?.value?.profile?.country || '');
      }
      phoneNumberRef.value?.resetValidation();
      mobileNumberRef.value?.resetValidation();
      address1Ref.value?.resetValidation();
      address2Ref.value?.resetValidation();
      zipRef.value?.resetValidation();
      cityRef.value?.resetValidation();
      countryRef.value?.resetValidation();
      onEdit.value = false;
    };

    const onSave = async () => {
      if (!(await address1Ref.value?.validate())) return;
      if (!(await zipRef.value?.validate())) return;
      if (!(await cityRef.value?.validate())) return;
      if (!(await countryRef.value?.validate())) return;

      const formData = <UserContactsForm>{
        userUUID: '',
        title: '',
        nickname: '',
        firstname: '',
        lastname: '',
        address1: '',
        address2: '',
        city: '',
        zip: '',
        country: '',
        phoneNumber: '',
        mobileNumber: '',
      };

      if (props.userRow) {
        Object.assign(formData, props.userRow.profile);
        formData.userUUID = props.userRow.uuid;
      } else {
        if (auth.user && auth.user.profile) {
          Object.assign(formData, auth.user.profile);
        } else {
          $q.notify({
            color: 'negative',
            textColor: 'white',
            icon: 'thumb_down_off_alt',
            message: t('profile.contacts.systemerror'),
            position: 'top-right',
            timeout: 3000,
          });
          return;
        }
      }

      formData.phoneNumber = phoneNumber.value;
      formData.mobileNumber = mobileNumber.value;
      formData.address1 = address1.value;
      formData.address2 = address2.value;
      formData.zip = zip.value;
      formData.city = city.value;
      formData.country = country.value?.value || '';
      if (auth.user?.uuid !== props.userRow.uuid) {
        formData.userUUID = props.userRow.uuid;
        const { data, error } = await Admin.UpdateUserContacts(formData);
        if (!error) {
          emit('update', data);
          $q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'thumb_up_off_alt',
            message: t('profile.contacts.updatesuccess'),
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
            message: t('profile.contacts.updateerror'),
            position: 'top-right',
            timeout: 3000,
          });
        }
      }

      if (auth.user?.uuid == props.userRow.uuid) {
        formData.userUUID = props.userRow.uuid;
        const { data, error } = await Users.UpdateContacts(formData);
        if (!error) {
          emit('update', data);
          $q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'thumb_up_off_alt',
            message: t('profile.contacts.updatesuccess'),
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
            message: t('profile.contacts.updateerror'),
            position: 'top-right',
            timeout: 3000,
          });
        }
      }
    };

    return {
      userData,
      showError,
      errorMessage,
      onEdit,

      phoneNumberRef,
      mobileNumberRef,
      address1Ref,
      address2Ref,
      zipRef,
      cityRef,
      countryRef,

      phoneNumber,
      mobileNumber,
      address1,
      address2,
      zip,
      city,
      country,

      countyOptions,

      tab: ref('mails'),

      reset,
      onSave,

      start() {
        setTimeout(() => {
          phoneNumberRef?.value?.focus();
        }, 20);
      },
      filterFn(val: string, update: (p: Callback) => void, abort: () => void) {
        if (val.length < 2) {
          abort();
          return;
        }

        update(() => {
          const needle = val.toLowerCase();
          countyOptions.value = countries.filter(
            (v) => v.label.toLowerCase().indexOf(needle) > -1
          );
        });
      },
    };
  },
});
</script>
