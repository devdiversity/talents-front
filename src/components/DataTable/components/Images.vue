<template>
  <div>
    <div class="row col justify-center">
      <div class="row items-center">
        <q-btn :size="size" flat round :color="color" icon="image" @click="openImages" />
        <div class="q-ml-sm">{{ count }}</div>
      </div>
    </div>
    <ImagesDialog v-model="openDialog" :uuid="row.UUID" @saved="save" @deleted="deleted" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, onMounted, watch } from 'vue';
import ImagesDialog from '../../Images/ImagesDialog.vue';

export default defineComponent({
  name: 'DTImages',
  components: {
    ImagesDialog,
  },
  props: {
    row: {
      type: Object as PropType<Record<string, string | number | boolean>>,
      required: true,
    },
    data: {
      type: Object as PropType<Record<string, string>[]>,
      required: true,
      default: () => {
        return {};
      },
    },
    dense: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
  },
  setup(props, { emit }) {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const size = ref<string>(props.dense ? 'xs' : 'sm');
    const images = ref(props.data);
    const color = ref<string>('primary');
    const icon = ref<string>('info');
    const count = ref(0);
    const openDialog = ref(false);

    watch(
      () => props.data,
      (data) => {
        images.value = data;
        setValues();
      }
    );

    const setValues = () => {
      if (Array.isArray(images.value)) {
        count.value = images.value.length;
      } else {
        count.value = 0;
      }
    };

    onMounted(() => {
      setValues();
    });

    const openImages = () => {
      openDialog.value = true;
    };

    const action = (status: string) => {
      console.log(status);
    };

    const save = (uuid: string) => {
      emit('action', {
        action: 'newimage',
        row: props.row,
        data: uuid,
      });
    };

    const deleted = (uuid: string) => {
      emit('action', {
        action: 'deleteimage',
        row: props.row,
        data: uuid,
      });
    };

    return {
      action,
      openImages,
      openDialog,
      save,
      deleted,
      images,
      size,
      color,
      icon,
      count,
    };
  },
});
</script>
