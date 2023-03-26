<template>
  <div>
    <DrawerMenuItem :menu="menu" />
  </div>
</template>

<script lang="ts">
import { defineComponent, provide } from 'vue';
import useConfig from 'src/config/useConfig';
import DrawerMenuItem from 'src/components/toolbar/DrawerMenuItem.vue';
import { useRouter } from 'vue-router';

export interface Command {
  to?: string;
  command?: string;
}

export default defineComponent({
  name: 'UserMenu',
  components: {
    DrawerMenuItem,
  },
  setup() {
    const router = useRouter();

    const doCommand = async (command: Command) => {
      if (command.to) {
        await router.push(command.to);
      } else if (command.command) {
        console.log(command.command);
      }
    };
    provide('doCommand', doCommand);
    const { adminMenu } = useConfig();

    return {
      menu: adminMenu,
    };
  },
});
</script>
