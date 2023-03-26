<template>
  <q-dialog
    class="profile-dialog-edit"
    :maximized="$q.platform.is.mobile"
    v-model="open"
    @hide="hide"
    @show="afterShow"
    transition-show="slide-down"
    transition-hide="slide-up"
  >
    <q-card
      v-if="ready"
      :class="{
        'profile-dialog-card': true,
        'profile-dialog-card-max': $q.platform.is.mobile,
        'profile-dialog-card-min': !$q.platform.is.mobile,
      }"
    >
      <DialogToolbar
        :title="$t('userprofile.edit')"
        :subTitle="userSelected.email"
      ></DialogToolbar>

      <q-separator />

      <q-tabs
        v-model="tab"
        dense
        class="bg-primary text-white shadow-2"
        active-color="white"
        indicator-color="white"
        inline-label
        outside-arrows
        mobile-arrows
        style="max-width: 100vw;"
      >
        <q-tab name="main" label="Main" />
        <q-tab name="contacts" label="Contacts" />
        <q-tab name="social" label="Social" />
        <q-tab name="preferences" label="Preferences" />
      </q-tabs>
      <q-card-section v-if="ready" class="q-pa-none profile-dialog-section">
        <q-tab-panels keep-alive v-model="tab" animated>
          <q-tab-panel name="main">
            <MainData :userRow="userSelected" @update="updateProfile" />
          </q-tab-panel>

          <q-tab-panel name="contacts">
            <ContactsData :userRow="userSelected" @update="updateContacts" />
          </q-tab-panel>

          <q-tab-panel name="social">
            <SocialsData :userRow="userSelected" @update="updateSocials" />
          </q-tab-panel>

          <q-tab-panel name="preferences">
            <PreferencesData
              :userRow="userSelected"
              @update="updatePreferences"
            />
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>
      <q-separator />
    </q-card>
  </q-dialog>
</template>

<style lang="sass" scoped>
.profile-dialog-edit
  overflow: hidden

  .profile-dialog-card
    overflow: hidden
    padding: 0
    .profile-dialog-section
      height: calc(80vh - 76px)
      overflow-x: hidden
      overflow-y: scroll
    &.profile-dialog-card-max
      width: 100%
      height: 100vh
    &.profile-dialog-card-min
      width: 80vw
      min-width: 480px
      height: 80vh
</style>

<script lang="ts">
import { defineComponent, ref, PropType, computed } from 'vue';

import DialogToolbar from 'components/DialogToolbar.vue';
import { useQuasar } from 'quasar';
import MainData from 'src/components/User/MainData.vue';
import ContactsData from 'src/components/User/ContactsData.vue';
import SocialsData from 'src/components/User/SocialsData.vue';
import PreferencesData from 'src/components/User/PreferencesData.vue';
import { User } from 'src/api/imported';

export default defineComponent({
  name: 'ProfileDialog',
  components: {
    DialogToolbar,
    MainData,
    ContactsData,
    SocialsData,
    PreferencesData,
  },
  props: {
    modelValue: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    user: {
      type: Object as PropType<User>,
      required: true,
    },
  },
  emits: ['update:modelValue', 'update'],
  setup(props, { emit }) {
    const $q = useQuasar();
    const ready = ref(false);

    const open = computed({
      get: () => {
        return props.modelValue;
      },
      set: (value) => {
        emit('update:modelValue', value);
      },
    });

    const userSelected = ref<User>();

    const hide = () => {
      ready.value = false;
      open.value = false;
    };

    const save = () => {
      const result = true;
      if (result === true) {
        $q.notify({
          color: 'positive',
          textColor: 'white',
          icon: 'thumb_up_off_alt',
          message: 'preferences updated successfully!',
          position: 'top-right',
          timeout: 3000,
        });
        open.value = false;
      } else {
        $q.notify({
          color: 'negative',
          textColor: 'white',
          icon: 'thumb_down_off_alt',
          message: 'preferences update error',
          position: 'top-right',
          timeout: 3000,
        });
      }
    };

    const updateContacts = (result: User) => {
      emit('update', result);
    };

    const updateSocials = (result: User) => {
      emit('update', result);
    };

    const updateProfile = (result: User) => {
      emit('update', result);
    };

    const updatePreferences = (result: User) => {
      emit('update', result);
    };

    const afterShow = () => {
      console.log('afterShow', props);
      userSelected.value = JSON.parse(JSON.stringify(props.user));
      ready.value = true;
    };

    return {
      ready,
      open,
      tab: ref('main'),
      afterShow,
      hide,
      save,
      updateProfile,
      updateSocials,
      updatePreferences,
      updateContacts,
      userSelected,
    };
  },
});
</script>
