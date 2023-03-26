<template>
  <div v-if="data" class="row justify-center">
    {{ label }}
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from 'vue';
import { date } from 'quasar';
import { ITableDate } from '../types';

export default defineComponent({
  name: 'TableDate',
  props: {
    data: {
      type: String as PropType<string>,
      required: true,
    },
    componentConfig: {
      type: Object as PropType<ITableDate>,
      required: true,
    },
  },
  setup(props) {
    const label = ref<string>(
      date.formatDate(props.data, 'DD-MM-YYYYTHH:mm:ss.SSSZ')
    );

    if (props.componentConfig && props.componentConfig.format) {
      label.value = date.formatDate(props.data, props.componentConfig.format);
    }

    return {
      label,
    };
  },
});
</script>
