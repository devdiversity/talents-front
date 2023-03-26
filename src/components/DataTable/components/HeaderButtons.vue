<template>
  <div v-if="componentConfig" class="row q-mr-md">
    <div v-for="(v, k) in componentConfig" :key="k">
      <q-btn
        v-if="v.icon"
        class="q-ml-sm"
        :key="k"
        :icon="v.icon"
        :flat="v.flat"
        :size="v.size"
        :color="v.color"
        :unelevated="v.unelevated"
        @click="action(v.action)"
      >
        <span class="q-pl-sm">{{ v.label }}</span>
      </q-btn>
      <q-btn
        v-if="!v.icon"
        class="q-ml-sm"
        :key="k"
        :flat="v.flat"
        :size="v.size"
        :color="v.color"
        :unelevated="v.unelevated"
        @click="action(v.action)"
      >
        {{ v.label }}
      </q-btn>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { ITableMenu, ITableSchema, ITableRow } from '../types';

export default defineComponent({
  name: 'TableSearchHeaderButtons',
  props: {
    row: {
      type: Object as PropType<ITableRow>,
      required: false,
    },
    data: {
      type: Object as PropType<ITableSchema>,
      required: false,
    },
    componentConfig: {
      type: Object as PropType<ITableMenu>,
      required: true,
    },
  },
  setup(props, { emit }) {
    const action = (action: string) => {
      emit('action', { action: action, row: props.row });
    };

    return { action };
  },
});
</script>
