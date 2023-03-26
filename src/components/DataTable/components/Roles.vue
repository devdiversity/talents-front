<template>
  <div class="container row justify-start q-py-xs">
    <q-btn
      flat
      dense
      :disabled="!editable()"
      @click="
        tooltip?.hide();
        openDialog();
      "
    >
      <div v-for="(v, k) in types" :key="k">
        <div>
          <q-icon class="q-mx-sm" size="sm" :name="k"> </q-icon>
        </div>
      </div>
    </q-btn>
    <q-tooltip ref="tooltip" class="roles-tooltip shadow-4">
      <div v-html="tree" class="text-white roles-tooltip-content" />
    </q-tooltip>
    <roles-dialog
      v-model="open"
      :roles="roles"
      :user="row"
      @roles:saved="saved"
    />
  </div>
</template>

<style lang="sass" scoped>
.container
  width: 100%
</style>

<style lang="sass">
.roles-tooltip
  background: var(--q-primary)
  min-width: 160px
  .roles-tooltip-content
    padding: 0
    ul
      list-style-type: none
      padding: 0
      margin: 0
      li.selected
        color: var(--q-warning)
        font-weight: bold
        font-size: 110%
      li.selected
        span.item-text::before
          content: "*"
</style>

<script lang="ts">
import { defineComponent, ref, PropType, watch } from 'vue';
import { QTooltip, useQuasar } from 'quasar';
import RolesDialog from './RolesDialog.vue';
import { AuthRole, User } from 'src/api/imported';
import { useSystemStore } from 'src/stores/system';
import { useAuthStore } from 'src/stores/auth';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'TableSearchRoles',
  components: {
    RolesDialog,
  },
  props: {
    data: {
      type: Array as PropType<string[]>,
      required: true,
    },
    row: {
      type: Object as PropType<User>,
      required: true,
    },
    dense: {
      type: Boolean as PropType<boolean>,
      required: false,
    },
  },
  setup(props, { emit }) {
    const { t } = useI18n();
    const $q = useQuasar();
    const auth = useAuthStore();
    const system = useSystemStore();
    const tooltip = ref<QTooltip | null>(null);
    const roles = ref<string[]>(props.data);
    const types = ref<{ [key: string]: boolean }>(getRoleRoots(props.data));
    const tree = ref<string>('');
    const open = ref<boolean>(false);

    const html = getHTMLRolesTree(roles.value);
    tree.value = html;

    watch(
      () => props.data,
      (data) => {
        roles.value = data;
        types.value = getRoleRoots(data);
        const html = getHTMLRolesTree(roles.value);
        tree.value = html;
      }
    );

    function getRoleRoots(roles: string[]): { [key: string]: boolean } {
      const roots = <{ [key: string]: boolean }>{};
      roles.forEach((r) => {
        const role = system.roles.roles[r.toLowerCase()];
        if (role) {
          const ra = role.path.split('.');
          const rs = ra.slice().reverse();
          for (const x of rs) {
            const role = system.roles.roles[x];
            if (role) {
              if (role.icon) {
                if (!roots.hasOwnProperty(role.icon)) {
                  roots[role.icon] = true;
                }
                break;
              }
            }
          }
        }
      });
      return roots;
    }

    function getHTMLRolesTree(userRoles: string[]) {
      const level = 0;
      let html = `<ul>
    <li class="tooltip-item ${
      userRoles.includes('superadmin') ? 'selected' : ''
    }" ><span class="item-text">superadmin</span></li>`;

      const getRolesasHtml = (
        roles: AuthRole,
        level: number,
        userRoles: string[]
      ) => {
        level++;
        const _roles = Object.assign([], roles.roles);
        _roles.forEach((r) => {
          const s = (r as AuthRole).name || '';
          let l = '';
          for (let i = 0; i != level; i++) {
            l += '<span class="q-ml-sm"></span>';
          }
          html += `<li class="tooltip-item ${
            userRoles.includes(s.toLowerCase()) ? 'selected' : ''
          }">${l}<span class="item-text">${s.toLowerCase()}</span></li>`;
          getRolesasHtml(r as AuthRole, level, userRoles);
        });
      };

      getRolesasHtml(system.roles.tree as AuthRole, level, userRoles);
      return html + '</ul>';
    }

    const openDialog = () => {
      if (props.row && props.row.roles.includes(system.roles.superadmin)) {
        $q.dialog({
          title: t('superadmin-change'),
          message: t('superadmin-donotchange'),
          persistent: true,
        });
        return;
      }
      open.value = true;
    };

    const editable = (): boolean => {
      if (auth.user) {
        return (
          auth.user.roles.includes(system.roles.superadmin) ||
          auth.user.roles.includes(system.roles.rolesadmin)
        );
      }
      return false;
    };

    const saved = (roles: string[]) => {
      emit('action', {
        action: 'roles',
        row: props.row,
        data: roles,
      });
    };

    return {
      roles,
      types,
      tree,
      tooltip,
      saved,
      editable,
      openDialog,
      open,
    };
  },
});
</script>
