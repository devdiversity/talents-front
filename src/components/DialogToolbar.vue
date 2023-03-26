<template>
  <q-bar class="q-pa-none bg-primary text-white" style="min-height: 40px">
    <span class="q-pl-sm text-h6">{{ title }}</span>
    <span class="q-pl-sm text-subtitle2">{{ subTitle }}</span>
    <q-space />
    <q-btn class="q-mr-xs" flat size="sm" round icon="close" v-close-popup />
  </q-bar>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'DialogToolbar',
  props: {
    title: {
      type: String,
      required: true,
    },
    subTitle: {
      type: String,
    },
  },
});
</script>
