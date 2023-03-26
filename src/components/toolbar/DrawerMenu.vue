<template>
  <div>
    <q-item dense clickable v-ripple>
      <q-item-section v-if="menu.icon">
        <img class="logo" src="../../assets/logo.png" />
      </q-item-section>

      <q-item-section side>
        <div class="text-h4 float-right">Core GOTS</div>
      </q-item-section>
    </q-item>
    <q-separator />
    <UserMenuItem :menu="menu" />
  </div>
</template>

<style lang="sass" scoped>
.header
  max-height: 64px
.logo
  max-height: 64px
  max-width: 64px
</style>

<script lang="ts">
import { defineComponent, provide } from 'vue';
import useConfig from 'src/config/useConfig';
import UserMenuItem from './DrawerMenuItem.vue';
import { useRouter } from 'vue-router';

export interface Command {
  to?: string;
  command?: string;
}

export default defineComponent({
  name: 'UserMenu',
  components: {
    UserMenuItem,
  },
  setup() {
    const router = useRouter();

    const doCommand = async (command: Command) => {
      if (command.to) {
        await router.push(command.to);
      } else if (command.command) {
        switch (command.command) {
        }
      }
    };
    provide('doCommand', doCommand);
    const { userMenu } = useConfig();

    return {
      menu: userMenu,
    };
  },
});
</script>
