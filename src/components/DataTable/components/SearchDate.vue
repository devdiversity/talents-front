<template>
  <div class="row justify-between full-width" @click.stop="">
    <div class="row col bg-grey-3 q-mr-sm">
      <q-btn
        flat
        dense
        no-caps
        size="sm"
        style="width: 100%"
        :label="getSelected()"
      >
        <q-popup-proxy>
          <div>
            <q-date v-model="selected" range mask="DD-MM-YYYY" @input="change">
              <div class="row items-center justify-end q-gutter-sm">
                <q-btn label="Clear" color="primary" flat @click="clear" />
                <q-btn label="Cancel" color="primary" flat v-close-popup />
                <q-btn
                  label="OK"
                  color="primary"
                  flat
                  @click="select"
                  v-close-popup
                />
              </div>
            </q-date>
          </div>
        </q-popup-proxy>
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
import { defineComponent, PropType, ref } from 'vue';
import { ISearchData, ISelectedDate } from '../types';
import { date } from 'quasar';

export default defineComponent({
  name: 'TableSearchDate',
  props: {
    data: {
      type: String as PropType<string | undefined>,
      required: true,
    },
    componentConfig: {
      type: Object as PropType<unknown>,
      required: true,
    },
  },
  setup(props, { emit }) {
    const selected = ref<ISelectedDate>(<ISelectedDate>{});

    const clear = () => {
      selected.value = <ISelectedDate>{};
      emit('search', { field: props.data, value: '' } as ISearchData);
    };

    const getSelected = (): string => {
      if (typeof selected.value === 'string') return selected.value;
      else {
        if (!selected.value.from) return 'Select date';
        if (!selected.value.to) return selected.value.from;
        let diff = date.getDateDiff(
          date.extractDate(selected.value.to, 'DD-MM-YYYY'),
          date.extractDate(selected.value.from, 'DD-MM-YYYY'),
          'days'
        );
        return `${selected.value.from} + ${diff} ${diff > 1 ? 'days' : 'day'}`;
      }
    };

    const select = () => {
      emit('search', {
        field: props.data,
        value: selected.value,
        type: 'date',
      } as ISearchData);
    };

    const change = () => {
      console.log(selected.value);
    };

    return { selected, clear, select, change, getSelected };
  },
});
</script>
