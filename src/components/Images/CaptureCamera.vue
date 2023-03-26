<template>
  <div :style="{ width: '320px' }">
    <div class="container row justify-center">
      <video ref="video" height="480" width="640"></video>
      <q-btn
        class="save-fab"
        fab
        size="sm"
        icon="add_a_photo"
        color="primary"
        @click="take_photo"
      >
      </q-btn>
    </div>

    <div
      v-if="getVideoDevicesLabel().length > 1"
      class="row justify-between full-width"
    >
      <q-select
        dense
        v-model="cameras"
        :options="getVideoDevicesLabel()"
        label="camera"
      />
    </div>
  </div>
</template>

<style lang="sass" scoped>
.container
  position: relative
  .save-fab
    position: absolute
    bottom: 10px
    right:  -10px
</style>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';

enum CameraMode {
  User = 'user',
  Environment = 'environment',
}

export default defineComponent({
  name: 'CaptureCamera',
  emits: ['taked'],
  props: {
    width: {
      type: Number,
      required: false,
      default: 340,
    },
  },
  setup(props, { emit }) {
    console.log('setup component');
    const mode: CameraMode = CameraMode.Environment;
    let canvas: HTMLCanvasElement;
    const video = ref<HTMLVideoElement>();
    const devices = ref<MediaDeviceInfo[]>();

    onMounted(async () => {
      await init();
    });

    const init = async () => {
      devices.value = await navigator.mediaDevices.enumerateDevices();
      await init_camera();
    };

    const getVideoDevices = (): MediaDeviceInfo[] => {
      if (devices.value) {
        const videoDevices = devices.value.filter((d) => {
          return d.kind === 'videoinput';
        });
        return videoDevices;
      }
      return [];
    };
    const getVideoDevicesLabel = (): string[] => {
      const d = getVideoDevices();
      const l = <string[]>[];
      d.map((device) => {
        l.push(device.label);
      });
      return l;
    };

    const init_camera = async () => {
      const stream = await get_media();
      canvas = document.createElement('canvas');
      if (video.value) {
        video.value.onloadedmetadata = () => {
          video.value?.play();
        };
        video.value.oncanplay = () => {
          on_video_ready();
        };
        video.value.srcObject = stream;
      }
    };

    const get_media = async (): Promise<MediaStream> => {
      const constraints = { audio: false, video: { facingMode: mode } };
      return navigator.mediaDevices.getUserMedia(constraints);
    };

    const on_video_ready = () => {
      if (video.value) {
        canvas.width = props.width;
        canvas.height =
          video.value.videoHeight / (video.value.videoWidth / props.width);
        video.value.setAttribute('height', canvas.height.toString());
        video.value.setAttribute('width', canvas.width.toString());
      }
    };

    const take_photo = () => {
      if (video.value) {
        const context = canvas.getContext('2d');
        context?.drawImage(video.value, 0, 0, canvas.width, canvas.height);
        const url = canvas.toDataURL('image/png');
        emit('taked', url);
      }
    };

    return {
      video,
      devices,
      take_photo,
      getVideoDevices,
      cameras: ref(null),
      getVideoDevicesLabel,
    };
  },
});
</script>
