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
import { ITableStatusConfig } from '../types';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { User } from 'src/api/imported';

export default defineComponent({
  name: 'DTStatus',
  props: {
    row: {
      type: Object as PropType<User>,
      required: true,
    },
    data: {
      type: String as PropType<string>,
      required: true,
    },
    componentConfig: {
      type: Object as PropType<ITableStatusConfig>,
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
    const status = ref(props.data.toLowerCase());
    const color = ref<string>('primary');
    const icon = ref<string>('info');

    watch(
      () => props.data,
      (data) => {
        status.value = data;
        setValues();
      }
    );

    const setValues = () => {
      if (props.componentConfig[status.value]) {
        color.value = props.componentConfig[status.value].color;
        icon.value = props.componentConfig[status.value].icon;
      }
    };

    onMounted(() => {
      setValues();
    });

    const action = (status: string) => {
      console.log(status);
      if (status === props.row.status) {
        $q.dialog({
          title: t('error'),
          message: t('samestatus'),
          persistent: true,
        });
        return;
      }
      if (props.row && props.componentConfig) {
        const _status = props.row.status.toLowerCase();
        $q.dialog({
          title: t('status.title'),
          html: true,
          message: `${t('status.user')}: <b>${props.row.email}</b>
              <br>${t('status.youconfirm')}<br>${t('status.from')} <span style="font-size: 120%; font-weight: bold; " class="text-${props.componentConfig[_status].color}">${
            props.componentConfig[_status].label
          }</span> ${t('status.to')}
              <span style="font-size: 120%; font-weight: bold;" class="text-${props.componentConfig[status].color}">${props.componentConfig[status].label}</span>`,
          persistent: true,
          ok: {
            color: props.componentConfig[status].color,
            label: t('status.change'),
            tabindex: 0,
            icon: props.componentConfig[status].icon,
          },
          cancel: { flat: true, label: t('status.cancel'), tabindex: 1 },
        }).onOk(() => {
          if (props.row) {
            emit('action', {
              action: 'status',
              row: props.row,
              data: status,
            });
          }
        });
      }
    };

    return { action, size, color, icon, status };
  },
});
</script>
