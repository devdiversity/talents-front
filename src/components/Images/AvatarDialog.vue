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
      v-if="ready"
      :class="{
        'avatar-card': true,
        'avatar-card-max': $q.platform.is.mobile,
        'avatar-card-min': !$q.platform.is.mobile,
      }"
    >
      <DialogToolbar title="avatar.edit" />

      <q-file
        ref="fileInput"
        style="display: none;"
        v-model="new_file"
        outlined
        label="select avatar"
        accept=".jpg, image/*"
        @update:model-value="update"
      />

      <q-card-actions class="q-mx-sm q-mb-sm">
        <div class="row items-end justify-between full-width">
          <q-avatar v-if="!result" size="100px">
            <img :src="src" @error="fallback" />
          </q-avatar>
          <q-avatar v-if="result" size="100px">
            <preview
              :width="100"
              :height="100"
              :image="result?.image"
              :coordinates="result?.coordinates"
            />
          </q-avatar>
          <div />
          <div class="row">
            <q-btn
              class="q-ml-sm"
              color="primary"
              icon="add_a_photo"
              @click="getCamera"
            />
            <q-btn
              class="q-ml-sm"
              color="primary"
              icon="camera_roll"
              @click="getFile"
            />
            <q-btn
              :disabled="!result"
              class="q-ml-sm"
              color="primary"
              icon="save"
              @click="save"
            />
          </div>
        </div>
      </q-card-actions>
      <q-separator />
      <q-card-section class="container q-pa-md" style="min-height: 302px;">
        <cropper
          v-if="file"
          ref="cropperLib"
          :src="file"
          @change="change"
          :stencil-props="{
            aspectRatio: 1 / 1,
            movable: true,
            resizable: true,
          }"
          :stencil-component="circleStencil"
          :canvas="{
            minHeight: 0,
            minWidth: 0,
            maxHeight: 128,
            maxWidth: 128,
          }"
        />
        <div v-if="cameraActive" class="column justify-center">
          <div class="row justify-center" style="max-height: 270px;">
            <CaptureCamera width="360" @taked="taked" />
          </div>
        </div>
        <div
          v-if="!cameraActive && !file"
          class="bg-grey-1"
          style="min-height: 302px; border: 2px solid #ccc;"
        />
      </q-card-section>
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
    &.avatar-card-max
      width: 100%
      height: 100vh
    &.avatar-card-min
      min-width: 450px
      max-height: 80vh
</style>

<script lang="ts">
interface CropperResult {
  coordinates: Coordinates;
  visibleArea: VisibleArea;
  canvas?: HTMLCanvasElement;
  image: {
    width: number;
    height: number;
    transforms: ImageTransforms;
    src: string | null;
  };
}
import {
  defineComponent,
  ref,
  PropType,
  computed,
  watchEffect,
  shallowRef,
  watch,
} from 'vue';

import {
  Coordinates,
  VisibleArea,
  ImageTransforms,
  CircleStencil,
  Cropper,
  Point,
  Preview,
  Transform,
} from 'vue-advanced-cropper';

import 'vue-advanced-cropper/dist/style.css';
import 'vue-advanced-cropper/dist/theme.compact.css';
import { QInput } from 'quasar';
import CaptureCamera from 'src/components/Images/CaptureCamera.vue';
import DialogToolbar from 'src/components/DialogToolbar.vue';
import { avatars } from 'src/api/imported';
import { useAuthStore } from 'src/stores/auth';

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

enum Status {
  init = 1,
  camera,
  crop,
}

export default defineComponent({
  name: 'AvatarDialog',
  components: {
    Cropper,
    Preview,
    CaptureCamera,
    DialogToolbar,
  },
  props: {
    modelValue: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    avatar: {
      type: String as PropType<string>,
      required: true,
    },
  },
  emits: ['update:modelValue', 'save'],
  setup(props, { emit }) {
    const ready = ref(false);
    const status = ref<Status>(Status.init);
    const cameraActive = ref(false);
    const new_file = shallowRef<File>();
    const file = shallowRef<string>();
    const result = shallowRef<CropperResult>();
    const circleStencil = shallowRef(CircleStencil);
    const reader = new FileReader();
    const fileInput = ref<QInput>();
    const cropperLib = ref<CropperComponent>();
    const src = ref(props.avatar);
    const auth = useAuthStore();

    watch(
      () => props.modelValue,
      (data) => {
        if (data) {
          result.value = undefined;
          file.value = '';
          cameraActive.value = false;
        }
      }
    );

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    watchEffect(() => {});

    const open = computed({
      get: () => {
        return props.modelValue;
      },
      set: (value) => {
        emit('update:modelValue', value);
      },
    });

    reader.addEventListener(
      'load',
      function () {
        // convert image file to base64 string
        file.value = reader.result as string;
        new_file.value = undefined;
      },
      false
    );

    const update = () => {
      reader.readAsDataURL(new_file.value as Blob);
    };

    const hide = () => {
      open.value = false;
    };

    const save = () => {
      // open.value = false;
      if (cropperLib.value) {
        const { canvas } = cropperLib.value?.getResult();
        if (canvas) {
          emit('save', canvas.toDataURL());
        }
      }
    };

    const change = (_result: CropperResult) => {
      result.value = _result;
      status.value = Status.crop;
    };

    const afterShow = () => {
      if (!props.avatar) {
        src.value = `${avatars}defaultAvatar.png`;
      }
      ready.value = true;
    };

    const getFile = () => {
      result.value = undefined;
      file.value = '';
      cameraActive.value = false;
      if (fileInput.value) {
        const el = fileInput.value.$el as HTMLInputElement;
        el.click();
      }
    };

    const getCamera = () => {
      result.value = undefined;
      file.value = '';
      cameraActive.value = true;
      status.value = Status.camera;
    };

    const taked = (data: string) => {
      cameraActive.value = false;
      file.value = data;
    };

    const fallback = () => {
      src.value = `${avatars}defaultAvatar.png`;
    };

    return {
      circleStencil,
      ready,
      open,
      file,
      result,
      new_file,
      fileInput,
      cropperLib,
      getFile,
      getCamera,
      afterShow,
      change,
      hide,
      save,
      update,
      cameraActive,
      taked,
      status,
      src,
      fallback,
      auth,
    };
  },
});
</script>
