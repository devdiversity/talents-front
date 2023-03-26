<template>
  <div class="row justify-center">
    <q-btn size="sm" flat round icon="more_vert">
      <q-popup-proxy>
        <!-- <div class="row q-pa-sm">searchTextStrategy {{ data.searchTextStrategy }}</div> -->
        <div class="row q-pa-xs">
          <span class="q-px-sm" style="font-size: 120%;">{{
            $t('table.changecolumns')
          }}</span>
        </div>
        <q-list bordered padding>
          <q-item v-for="(v, k) in selectedColumns" :key="k" dense>
            <q-item-section side top>
              <q-toggle
                v-model="v.selected"
                @update:model-value="changeSelected(v)"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{
                $t(`table.selectcolumn.${v.label.toLowerCase()}`)
              }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        <div class="row q-pa-xs justify-end">
          <q-btn flat dense size="small" v-close-popup
            ><span class="q-mx-md">{{
              $t('table.changecolumnsok')
            }}</span></q-btn
          >
        </div>
      </q-popup-proxy>
    </q-btn>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from 'vue';
import { ITableSchema, ITableRow } from '../types';

interface ISelected {
  label: string;
  selected: boolean;
}

export default defineComponent({
  name: 'TableSearchConfig',
  props: {
    row: {
      type: Object as PropType<ITableRow>,
      required: false,
    },
    data: {
      type: Object as PropType<ITableSchema>,
      required: true,
    },
  },
  setup(props, { emit }) {
    const selectedColumns = ref<ISelected[]>([]);
    props.data?.columns.map((column) => {
      if (!column.required) {
        selectedColumns.value.push(<ISelected>{
          label: column.label,
          selected: true,
        });
      }
    });

    const changeSelected = (v: ISelected) => {
      emit('action', { action: 'selectColumn', row: v });
    };

    return {
      changeSelected,
      selectedColumns,
    };
  },
});
</script>
