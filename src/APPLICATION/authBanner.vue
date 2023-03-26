<template>
  <div class="header q-mb-sm row items-center justify-between">
    <img src="../assets/logo.png" />
    <h3>Core GOTS</h3>
  </div>
</template>

<style scoped>
body {
  margin: 0;
}

h1 {
  letter-spacing: 3px;
  font-size: 24px;
  padding: 0 0 0 20px;
}

.header {
  position: relative;
  max-height: 100px;
}

img {
  max-height: 80px;
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AuthBanner',
  setup() {
    console.log('setup component');
  },
});
</script>
