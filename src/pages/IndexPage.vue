<template>
  <q-page class="row items-center justify-evenly">
    <example-component title="Example component"></example-component>
    {{ store.roles }}
    <br />
    {{ JSON.stringify(store.ready) }}
    <br />
    {{ JSON.stringify(auth.isLogged) }}

    <q-btn type="a" to="/admin"> admin users </q-btn>

    <q-btn type="a" to="/login"> login </q-btn>
    <q-btn type="a" to="/home"> landing page </q-btn>
    <q-btn label="Miei annunci" to="/manage"></q-btn>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useSystemStore } from 'stores/system';
import { useAuthStore } from 'stores/auth';

export default defineComponent({
  name: 'IndexPage',
  components: {},
  setup() {
    const store = useSystemStore();
    const auth = useAuthStore();

    return {
      store,
      auth,
    };
  },
});
</script>
