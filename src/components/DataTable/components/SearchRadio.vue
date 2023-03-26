<template>
  <div class="row col justify-between full-width" @click.stop="">
    <div class="row justify-center">
      <q-btn
        v-if="componentConfig && selected == -1"
        size="sm"
        flat
        round
        icon="list"
      >
        <q-menu auto-close>
          <q-list style="min-width: 100px;" dense>
            <div
              v-close-popup
              v-for="(v, k) in componentConfig.options"
              :key="k"
            >
              <q-item clickable dense @click="select(v.value, k)">
                <q-item-section avatar size="sm">
                  <q-icon :color="v.color" :name="v.icon" size="xs" />
                </q-item-section>
                <q-item-section>{{ v.label }}</q-item-section>
              </q-item>
            </div>
          </q-list>
        </q-menu>
      </q-btn>
      <q-btn
        v-else
        size="sm"
        flat
        round
        :color="config.options[selected].color"
        :icon="config.options[selected].icon"
      />
    </div>
    <div class="row items-center">
      <div>
        <q-btn flat round size="xs" icon="close" @click.stop="clear" />
      </div>
    </div>
  </div>
</template>

<style lang="sass" scoped>
.table-th-search-input:focus
  outline: 0
  border-width: 0 0 2px
  border-color: var(--q-color-primary)
.table-th-search-input
  background-color: #eee
  outline: 0
  border-width: 0 0 2px
  border-color: transparent
  width: 100%
@-moz-document url-prefix()
  .table-th-search-input
    width: 100%
</style>
<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import {
  ISearchData,
  ITableSearchConfig,
  ITableSearchConfigRadio,
} from '../types';

export default defineComponent({
  name: 'TableSearchRadio',
  props: {
    data: {
      type: String as PropType<string>,
      required: true,
    },
    componentConfig: {
      type: Object as PropType<ITableSearchConfig<ITableSearchConfigRadio>>,
      required: true,
    },
  },
  setup(props, { emit }) {
    const selected = ref<number>(-1);
    const config = ref<ITableSearchConfig<ITableSearchConfigRadio>>(
      props.componentConfig
    );

    const clear = () => {
      selected.value = -1;
      emit('search', { field: props.data, value: '' } as ISearchData);
    };

    const select = (v: string, k: number) => {
      selected.value = k;
      emit('search', {
        field: props.data,
        value: v,
        type: 'selective',
      } as ISearchData);
    };

    return { selected, config, clear, select };
  },
});
</script>
