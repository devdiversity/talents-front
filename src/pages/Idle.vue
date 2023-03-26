<template>
  <q-page class="row items-center justify-evenly">
    <img
      v-if="auth.isIdle"
      class="absolute-center icon-top"
      src="../assets/IdleSleep.svg"
      style="height: 128px;"
    />
    <q-card
      v-if="!auth.isIdle && auth.preferences.useIdlePassword"
      class="idle-card"
      style="min-width: 320px;"
    >
      <q-card-section v-if="auth.preferences.useIdlePassword">
        <q-input
          v-model="password"
          :type="hidePassword ? 'password' : 'text'"
          autofocus
          :label="$t('idle.pinlabel')"
          stack-label
          @blur="
            hidePassword = true;
            hasFocus = false;
          "
          @focus="
            wrongPin = false;
            hasFocus = true;
          "
          :error="wrongPin || !isValid"
          bottom-slots
          lazy-rules
        >
          <template v-slot:append>
            <q-icon
              :name="hidePassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="hidePassword = !hidePassword"
            />
          </template>

          <template v-slot:error>
            <span>{{
              wrongPin ? $t('idle.wrongpin') : $t('idle.passwordrequired')
            }}</span>
          </template>
        </q-input>
      </q-card-section>
      <q-separator />

      <q-card-actions align="right">
        <q-btn color="primary" @click="home">{{('idle.gohome')}}</q-btn>
        <q-btn color="primary" @click="go">{{('idle.resume')}}</q-btn>
      </q-card-actions>
    </q-card>
    <div v-if="!auth.isIdle && !auth.preferences.useIdlePassword">
      <q-btn
        class="q-mx-md"
        color="primary"
        @click="home"
        >{{('idle.gohome')}}</q-btn
      >
      <q-btn
        class="q-mx-md"
        color="primary"
        @click="go"
        >{{('idle.resume')}}</q-btn
      >
    </div>
  </q-page>
</template>

<script lang="ts">
// import ExampleComponent from 'components/CompositionComponent.vue';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/auth';
import { computed, defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router';

export default defineComponent({
  name: 'PageIdle',
  setup() {
    const { t } = useI18n();
    const $q = useQuasar();
    const auth = useAuthStore();
    const router = useRouter();
    const route = useRoute();
    const from = ref();
    const password = ref('');
    const hasFocus = ref(false);
    const hidePassword = ref(true);
    const wrongPin = ref(false);

    if (route.params.from != '/idle') {
      from.value = route.params.from;
    }
    console.log(route.params);

    onBeforeRouteUpdate((to, from) => {
      // only fetch the user if the id changed as maybe only the query or the hash changed
      console.log(from, to);
    });

    const go = async () => {
      if (
        auth.preferences.useIdlePassword &&
        password.value != auth.preferences.idlePin
      ) {
        $q.notify({
          color: 'negative',
          textColor: 'white',
          icon: 'thumb_down_off_alt',
          message: t('idle.wrongpin'),
          position: 'top-right',
          timeout: 3000,
        });
        wrongPin.value = true;
        return;
      }
      await router.push(from.value);
    };

    const home = async () => {
      if (
        auth.preferences.useIdlePassword &&
        password.value != auth.preferences.idlePin
      ) {
        $q.notify({
          color: 'negative',
          textColor: 'white',
          icon: 'thumb_down_off_alt',
          message: t('idle.wrongpin'),
          position: 'top-right',
          timeout: 3000,
        });
        return;
      }
      await router.push('/');
    };

    return {
      auth,
      from,
      password,
      hasFocus,
      isValid: computed(() => password.value.length > 5 || hasFocus.value),
      wrongPin,
      hidePassword,
      home,
      go,
    };
  },
});
</script>
