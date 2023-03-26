<template>
  <q-menu>
    <q-list style="min-width: 100px;">
      <q-item
        v-for="(v, k) in system.languages"
        :key="k"
        clickable
        v-close-popup
        @click="language = v.lang"
      >
        <q-item-section>{{ $t(v.label) }}</q-item-section>
      </q-item>
    </q-list>
  </q-menu>
</template>

<script lang="ts">
import { useSystemStore } from 'src/stores/system';
import { computed, defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'LangSelectorMenu',
  props: {
    modelValue: {
      type: String as PropType<string>,
      required: true,
    },
  },
  setup(props, { emit }) {
    const language = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value),
    });
    const system = useSystemStore();
    return { system, language };
  },
});
</script>
