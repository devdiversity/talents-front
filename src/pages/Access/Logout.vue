<template>
  <q-page class="flex bg-image flex-center">
    <q-card
      v-if="auth.isLogged"
      v-bind:style="
        $q.screen.lt.sm ? { width: '100%' } : { 'min-width': '380px' }
      "
      flat
    >
      <q-card-section>
        <AuthBanner />
      </q-card-section>

      <q-card-section>
        <q-btn
          class="full-width q-mb-sm"
          unelevated
          label="Logout"
          type="button"
          color="blue-7"
          @click="doLogOut"
        />
        <q-separator size="2px" color="blue-7" />
        <q-btn
          class="full-width q-mt-sm"
          unelevated
          label="Home"
          type="button"
          color="blue-7"
          @click="$router.push('/')"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<style lang="sass" scoped>
/* unvisited link */
a:link
  color: $blue-7
/* visited link */
a:visited
  color: $blue-7
/* mouse over link */
a:hover
  color: $blue-5
/* selected link */
a:active
  color: $blue-7
.icon-top
  max-width: 80px
  top: 0px
</style>

<script lang="ts">
import { defineComponent } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import AuthBanner from 'src/APPLICATION/authBanner.vue';
import { Users } from 'src/api/imported';
import { useAuthStore } from 'stores/auth';

export default defineComponent({
  name: 'LogoutFromAccount',
  components: {
    AuthBanner,
  },
  setup() {
    const $q = useQuasar();
    const auth = useAuthStore();
    const router = useRouter();
    const doLogOut = async () => {
      $q.loading.show();
      await Users.LogoutFromAccount();
      await auth.get();
      setTimeout(async () => {
        $q.loading.hide();
        await router.push('/');
      }, 2000);
    };
    return {
      doLogOut,
      auth,
    };
  },
});
</script>
