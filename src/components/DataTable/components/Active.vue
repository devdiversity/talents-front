<template>
  <div class="row col justify-center">
    <q-btn :size="size" flat round :color="color" :icon="icon">
      <q-menu auto-close>
        <q-list style="min-width: 100px">
          <div v-close-popup v-for="(v, k) in componentConfig" :key="k">
            <q-item clickable @click="action(k as string)">
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
import { defineComponent, PropType, ref, onMounted, watch } from 'vue';
import { ITableActiveConfig } from '../types';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'DTActive',
  props: {
    row: {
      type: Object as PropType<Record<string, string | number | boolean>>,
      required: true,
    },
    data: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    componentConfig: {
      type: Object as PropType<ITableActiveConfig>,
      required: true,
    },
    dense: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
  },
  setup(props, { emit }) {
    // eslint-disable-next-line @typescript-eslint/unbound-method

    const { t } = useI18n();
    const size = ref<string>(props.dense ? 'xs' : 'sm');
    const $q = useQuasar();
    const status = ref(props.data);
    const color = ref<string>('primary');
    const icon = ref<string>('info');

    watch(
      () => props.data,
      (data) => {
        status.value = data as unknown as boolean;
        setValues();
      }
    );

    const setValues = () => {
      color.value = props.componentConfig[status.value ? 'active' : 'inactive'].color;
      icon.value = props.componentConfig[status.value ? 'active' : 'inactive'].icon;
    };

    onMounted(() => {
      setValues();
    });

    const action = (status: string) => {
      console.log(status);
      const newStatus = status == 'active' ? true : false;
      if (newStatus === props.row.active) {
        $q.dialog({
          title: t('error'),
          message: t('samevalue'),
          persistent: true,
        });
        return;
      }
      if (props.row && props.componentConfig) {
        emit('action', {
          action: 'active',
          row: props.row,
          data: newStatus,
        });
      }
    };

    return { action, size, color, icon, status };
  },
});
</script>
