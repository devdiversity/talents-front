<template>
  <q-page class="column test">
    <AvatarDialog
      v-model="openAvatar"
      :avatar="auth.avatar"
      @save="saveAvatar"
    />

    <div v-if="auth.isLogged" class="row items-center q-pa-sm">
      <div class="row items-center">
        <div class="q-mr-md" style="position: relative;">
          <AvatarImage size="64px" />
          <q-btn
            round
            color="primary"
            size="sm"
            icon="edit"
            style="position: absolute; right: -5px; bottom: -5px;"
            @click="editAvatar"
          />
        </div>
        <div class="column">
          <div class="text-bold">
            <span class="q-mx-sm">{{ auth.user?.profile?.title }}</span>
            <span class="q-mr-sm">{{ auth.user?.profile?.firstName }}</span>
            <span class="q-mr-sm">{{ auth.user?.profile?.lastName }}</span>
          </div>
          <div class="q-mx-sm text-caption">
            {{ auth.user?.profile?.nickname }}
          </div>
        </div>
      </div>
    </div>
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

    <q-separator />

    <q-tab-panels keep-alive v-model="tab" animated>
      <q-tab-panel name="main">
        <MainData :userRow="auth.user" />
      </q-tab-panel>

      <q-tab-panel name="contacts">
        <ContactsData :userRow="auth.user" />
      </q-tab-panel>

      <q-tab-panel name="social">
        <SocialsData :userRow="auth.user" />
      </q-tab-panel>

      <q-tab-panel name="preferences">
        <PreferencesData :userRow="auth.user" />
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script lang="ts">
// import ExampleComponent from 'components/CompositionComponent.vue';
import { defineComponent, ref } from 'vue';
import AvatarImage from 'components/Images/Avatar.vue';
import MainData from 'src/components/User/MainData.vue';
import ContactsData from 'src/components/User/ContactsData.vue';
import SocialsData from 'src/components/User/SocialsData.vue';
import PreferencesData from 'src/components/User/PreferencesData.vue';
import AvatarDialog from 'src/components/Images/AvatarDialog.vue';
import { useAuthStore } from 'stores/auth';
import { Avatar } from 'src/api/imported';

export default defineComponent({
  name: 'PageIndex',
  components: {
    AvatarImage,
    MainData,
    ContactsData,
    SocialsData,
    PreferencesData,
    AvatarDialog,
  },
  setup() {
    const showError = ref<boolean>(false);
    const errorMessage = ref<string>('');
    const auth = useAuthStore();
    const openAvatar = ref<boolean>(false);

    const editAvatar = () => {
      openAvatar.value = true;
    };

    const saveAvatar = async (avatar: string) => {
      const { error } = await Avatar.SaveAvatar({
        UUID: auth.user?.uuid || '',
        avatar: avatar,
      });
      if (!error) {
        auth.setAvatar();
        auth.refresh();
        openAvatar.value = false;
      }
    };

    return {
      auth,
      showError,
      errorMessage,
      tab: ref('main'),
      openAvatar,
      editAvatar,
      saveAvatar,
    };
  },
});
</script>
