<template>
  <q-page class="row items-center justify-evenly">
    {{ store.roles }}

    {{ JSON.stringify(store.ready) }}
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useSystemStore } from 'stores/system';
export default defineComponent({
  name: 'IndexPage',
  components: {},
  setup() {
    const store = useSystemStore();
    return {
      store,
    };
  },
});
</script>
