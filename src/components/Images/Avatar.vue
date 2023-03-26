<template>
  <q-avatar :size="size">
    <img :src="auth.avatar" @error="fallback" />
  </q-avatar>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useAuthStore } from 'stores/auth';

export default defineComponent({
  name: 'AvatarImage',
  props: {
    size: {
      type: String,
      default: '128px',
    },
  },
  setup() {
    const auth = useAuthStore();
    const src = ref();
    const fallback = () => {
      auth.setDefaultAvatar();
    };

    return {
      src,
      auth,
      fallback,
    };
  },
});
</script>
