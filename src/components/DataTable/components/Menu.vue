<template>
  <div class="row col justify-center">
    <q-btn v-if="componentConfig" flat round icon="more_vert" :size="size">
      <q-menu auto-close>
        <q-list style="min-width: 100px">
          <div v-close-popup v-for="(v, k) in componentConfig" :key="k">
            <q-item clickable @click="action(v.action)">
              <q-item-section avatar>
                <q-icon :color="v.color" :name="v.icon" />
              </q-item-section>
              <q-item-section>{{ v.label }}</q-item-section>
            </q-item>
          </div>
        </q-list>
      </q-menu>
    </q-btn>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { ITableMenu, ITableRow } from '../types';

export default defineComponent({
  name: 'TableSearchMenu',
  props: {
    row: {
      type: Object as PropType<ITableRow>,
      required: true,
    },
    componentConfig: {
      type: Object as PropType<ITableMenu>,
      required: true,
    },
    dense: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
  },
  setup(props, { emit }) {
    const size = ref<string>(props.dense ? 'xs' : 'sm');
    const action = (action: string) => {
      emit('action', { action: action, row: props.row });
    };

    return { action, size };
  },
});
</script>
