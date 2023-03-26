<template>
  <div class="row justify-between full-width" @click.stop="">
    <div class="row col bg-grey-3 q-mr-sm">
      <q-btn
        flat
        dense
        no-caps
        size="sm"
        style="width: 100%"
        :label="selected ? selected : '...'"
      >
        <q-menu auto-close>
          <q-list style="min-width: 100px" dense>
            <div v-close-popup v-for="(v, k) in selection" :key="k">
              <q-item clickable @click="select(k)" dense>
                <q-item-section
                  ><span style="text-transform: uppercase">{{
                    k
                  }}</span></q-item-section
                >
                <q-item-section avatar>
                  <q-badge size="small">{{ v }}</q-badge>
                </q-item-section>
              </q-item>
            </div>
          </q-list>
        </q-menu>
      </q-btn>
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
import { defineComponent, PropType, ref, onMounted, watch } from 'vue';
import { ITableMenu, ISearchData } from '../types';

interface ISelection {
  [key: string]: number;
}

export default defineComponent({
  name: 'TableSearchArray',
  props: {
    data: {
      type: String as PropType<string>,
      required: true,
    },
    componentConfig: {
      type: Object as PropType<ITableMenu>,
      required: true,
    },
    rawData: {
      type: Object as PropType<unknown>,
      required: true,
    },
  },
  setup(props, { emit }) {
    const selected = ref<string>('');
    const selection = ref<ISelection>({});

    onMounted(() => {
      if (props.rawData)
        populateSelection(
          props.rawData as { [key: string]: string | string[] }[]
        );
    });

    const populateSelection = (val: { [key: string]: string | string[] }[]) => {
      selection.value = {};
      val.map((o) => {
        const text = o[props.data];
        if (typeof text === 'string') {
          let count = 1;
          if (selection.value.hasOwnProperty(text)) {
            count = selection.value[text] + 1;
          }
          selection.value[text] = count;
        } else if (o[props.data].length) {
          const a = Object.assign([], o[props.data]);
          a.map((r) => {
            let count = 1;
            if (selection.value.hasOwnProperty(r)) {
              count = selection.value[r] + 1;
            }
            selection.value[r] = count;
          });
        }
      });
    };

    const select = (val: string) => {
      selected.value = val;
      emit('search', {
        field: props.data,
        value: selected.value,
        type: 'array',
      } as ISearchData);
    };

    const clear = () => {
      selected.value = '';
      emit('search', {
        field: props.data,
        value: selected.value,
        type: 'array',
      } as ISearchData);
    };

    watch(
      () => props.rawData,
      (rawData) => {
        populateSelection(rawData as { [key: string]: string | string[] }[]);
        selected.value = '';
      }
    );

    return { select, clear, selected, selection };
  },
});
</script>
