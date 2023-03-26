<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn v-if="auth.isLogged" flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <!-- <img class="logo q-ml-sm" src="../assets/logo.png" /> -->
        <q-toolbar-title>
          Core GOTS
        </q-toolbar-title>

        <UserDropDown v-if="auth.user" />
        <q-btn v-else dense outline @click="doLogIn" icon="login"><span class="q-px-md">login</span></q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-if="auth.isLogged" v-model="leftDrawerOpen" bordered class="bg-grey-1">
      <q-list>
        <UserMenu />
        <q-separator />
        <q-separator />
        <AdminMenu />
        <q-separator />
        <q-separator />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style lang="sass" scoped>
.logo
  max-height: 32px
  max-width: 32px
</style>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useAuthStore } from 'stores/auth';
import { useRouter } from 'vue-router';
import UserDropDown from 'src/components/User/UserDropDown.vue';
import UserMenu from 'src/components/toolbar/DrawerMenu.vue';
import AdminMenu from 'src/components/admin/AdminMenu.vue';

export default defineComponent({
  name: 'MainLayout',

  components: { UserDropDown, UserMenu, AdminMenu },

  setup() {
    const auth = useAuthStore();
    const router = useRouter();
    const leftDrawerOpen = ref(false);

    const doLogOut = async () => {
      await router.push('/auth/logout');
    };

    const doLogIn = async () => {
      await router.push('/auth/login');
    };

    return {
      auth,
      leftDrawerOpen,
      doLogOut,
      doLogIn,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
});
</script>
