<template>
  <q-dialog
    class="avatar-edit"
    :maximized="$q.platform.is.mobile"
    v-model="open"
    @hide="hide"
    @show="afterShow"
    transition-show="slide-down"
    transition-hide="slide-up"
  >
    <q-card
      :class="{
        'avatar-card': true,
        'avatar-card-max': $q.platform.is.mobile,
        'avatar-card-min': !$q.platform.is.mobile,
      }"
    >
      <DialogToolbar title="images.cropper" />
      <div>
        <q-card-section class="container q-pa-md">
          <cropper
            v-if="file"
            ref="cropperLib"
            :src="file"
            @change="change"
            @ready="cropperReady"
          />
        </q-card-section>

        <q-card-actions>
          <div>
            <span> width: {{ result.coordinates.width }}</span>
            <span class="q-px-md">
              height: {{ result.coordinates.height }}</span
            >
          </div>
          <q-space />
          <q-btn
            class="q-ml-sm"
            size="sm"
            color="primary"
            icon="save"
            @click="save"
            ><span class="q-px-sm">Crop image</span></q-btn
          >
        </q-card-actions>
      </div>
    </q-card>
  </q-dialog>
</template>

<style lang="sass" scoped>
.avatar-edit
  overflow: hidden
  .avatar-card
    overflow: hidden
    .container
      overflow: hidden
      min-height: 100px
    &.avatar-card-max
      width: 100%
      height: 100vh
    &.avatar-card-min
      min-width: 50vw
      max-height: 80vh
</style>

<script lang="ts">
import { defineComponent, ref, PropType, computed, shallowRef } from 'vue';

import { Cropper, CropperResult, Point, Transform } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';
import 'vue-advanced-cropper/dist/theme.compact.css';
import DialogToolbar from 'components/DialogToolbar.vue';

interface CropperComponent {
  getResult: () => CropperResult;
  setCoordinates: (transform: Transform | Transform[]) => void;
  refresh: () => void;
  zoom: (factor: number, center?: Point) => void;
  move: (left: number, top?: number) => void;
  rotate: (angle: number) => void;
  flip: (horizontal: boolean, vertical?: boolean) => void;
  reset: () => void;
}

interface Result {
  coordinates: {
    width: number;
    height: number;
  };
}

export default defineComponent({
  name: 'CropperDialog',
  components: {
    Cropper,
    DialogToolbar,
  },
  props: {
    modelValue: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    file: {
      type: String as PropType<string>,
      required: true,
    },
  },
  emits: ['update:modelValue', 'cropped'],
  setup(props, { emit }) {
    const ready = ref(false);
    const result = shallowRef<Result>({ coordinates: { width: 0, height: 0 } });
    const cropperLib = ref<CropperComponent>();

    const open = computed({
      get: () => {
        return props.modelValue;
      },
      set: (value) => {
        emit('update:modelValue', value);
      },
    });

    const hide = () => {
      open.value = false;
    };

    const save = () => {
      if (cropperLib.value) {
        const { canvas } = cropperLib.value?.getResult();
        if (canvas) {
          const image = canvas.toDataURL('image/png');
          emit('cropped', image);
          open.value = false;
        }
      }
    };

    const change = (_result: CropperResult) => {
      result.value = _result;
    };

    const afterShow = () => {
      //
    };

    const cropperReady = () => {
      ready.value = true;
    };

    return {
      ready,
      open,

      result,

      cropperLib,
      afterShow,
      change,
      hide,
      save,
      cropperReady,
    };
  },
});
</script>
