<template>
  <q-bar class="q-pa-none bg-primary text-white" style="min-height: 40px">
    <div class="row items-center">
      <div class="q-px-sm text-h6">{{ $t(title) }}</div>
      <span>-</span>
      <span class="q-px-sm text-caption"> {{ subTitle }}</span>
    </div>
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
      required: false,
    },
  },
});
</script>
