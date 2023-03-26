<template>
  <div class="row no-wrap full-width" @click.stop="">
    <div class="row full-width">
      <input
        ref="searchInput"
        v-model="text"
        :th-search="data"
        class="table-th-search-input bg-grey-3"
        type="text"
        @click.stop=""
        @keyup="changed"
      />
    </div>
    <div class="row q-ml-sm" style="width: 28px;">
      <q-btn flat round size="xs" icon="close" @click.stop="clear" />
    </div>
  </div>
</template>

<style lang="sass" scoped>
.table-th-search-input:focus
  outline: 0
  border-width: 0 0 2px
  border-color: var(--q-color-primary)
.table-th-search-input
  outline: 0
  border-width: 0 0 2px
  border-color: transparent
  width: 100%
.table-th-search-input:hover
  background-color: #e0e0e0!important
@-moz-document url-prefix()
  .table-th-search-input
    width: 100%
</style>
<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { ITableMenu, ISearchData, ITableRow } from '../types';

export default defineComponent({
  name: 'TableTextSearch',
  props: {
    data: {
      type: String as PropType<string>,
      required: true,
    },
    rawData: {
      type: Object as PropType<ITableRow>,
      required: true,
    },
    componentConfig: {
      type: Object as PropType<ITableMenu>,
      required: true,
    },
  },
  setup(props, { emit }) {
    const searchInput = ref<HTMLInputElement | null>(null);
    const text = ref('');

    const clear = () => {
      if (searchInput.value) {
        searchInput.value.value = '';
        emit('search', { field: props.data, value: '' } as ISearchData);
        setTimeout(() => {
          searchInput.value?.focus();
        }, 500);
      }
    };

    const changed = () => {
      if (!text.value) return;
      emit('search', {
        field: props.data,
        value: text.value,
        type: 'text',
      });
    };

    return { clear, changed, searchInput, text };
  },
});
</script>
