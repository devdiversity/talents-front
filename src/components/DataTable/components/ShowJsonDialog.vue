<template>
  <q-dialog v-model="open" @hide="hide" @before-show="beforeShow">
    <q-card class="my-card" style="min-width: 450px">
      <q-card-section>
        <div class="row justify-between items-center">
          <div>
            <div class="text-h6">{{ $t('table.showjson') }}</div>
          </div>
          <q-space />
          <div>
            <q-btn icon="close" flat round dense v-close-popup />
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section class="q-pa-md">
        <pre>{{ data }}</pre>
      </q-card-section>
      <q-separator />
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, ref } from 'vue';
import { backend } from 'src/api/imported';

export default defineComponent({
  name: 'JsonDialog',
  components: {},
  props: {
    modelValue: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    data: {
      type: Object as PropType<Record<string, string | number | boolean>>,
      required: true,
      default: () => {
        return {};
      },
    },
  },
  emits: ['update:modelValue', 'saved', 'deleted'],
  setup(props, { emit }) {
    const site = ref(backend);

    const open = computed({
      get: () => {
        return props.modelValue;
      },
      set: (value) => {
        emit('update:modelValue', value);
      },
    });

    const openDialog = async () => {
      console.log('test', props.data);
    };

    const hide = () => {
      open.value = false;
    };

    const beforeShow = () => {
      openDialog();
    };

    return {
      open,
      hide,
      beforeShow,
      site,
    };
  },
});
</script>
