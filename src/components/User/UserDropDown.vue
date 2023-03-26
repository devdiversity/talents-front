<template>
  <q-btn-dropdown
    outline
    split
    size="sm"
    class=""
    :label="auth.user?.username ? auth.user?.username : auth.user?.email"
  >
    <q-list>
      <q-item clickable v-close-popup>
        <q-item-section avatar>
          <AvatarImage size="32px" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{
            auth.user?.username ? auth.user?.username : auth.user?.email
          }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-separator />
      <q-item clickable v-close-popup @click="doLogOut">
        <q-item-section avatar>
          <q-icon color="primary" name="logout" />
        </q-item-section>

        <q-item-section>
          <q-item-label>Logout</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'stores/auth';
import AvatarImage from 'components/Images/Avatar.vue';

export default defineComponent({
  name: 'UserdDropDown',
  components: { AvatarImage },
  props: {
    title: {
      type: String,
      required: false,
    },
  },
  setup() {
    const a = ref<string>('');

    const open = ref<boolean>(false);
    const router = useRouter();
    const auth = useAuthStore();

    // onMounted(async () => {
    //   a.value = (await avatar()) as string;
    // });

    const doLogOut = async () => {
      //await logout();
      await router.push('/auth/logout');
    };

    return {
      auth,
      avatar: a,
      open,
      doLogOut,
    };
  },
});
</script>
