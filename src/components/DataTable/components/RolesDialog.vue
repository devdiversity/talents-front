<template>
  <q-dialog v-model="open" @hide="hide" @before-show="beforeShow">
    <q-card class="my-card" style="min-width: 450px;">
      <q-card-section>
        <div class="row justify-between items-center">
          <div>
            <div class="text-h6">{{ $t('roles.edit') }}</div>
            <div class="text-subtitle2">{{ user?.email }}</div>
          </div>
          <q-space />
          <div>
            <q-btn icon="close" flat round dense v-close-popup />
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section class="q-pa-md">
        <q-tree
          v-if="ready"
          dense
          :nodes="content"
          node-key="name"
          children-key="roles"
          default-expand-all
        >
          <template v-slot:default-header="prop">
            <div v-if="prop.node.icon" class="row items-center">
              <q-icon
                :name="prop.node.icon"
                color="positive"
                size="sm"
                class="q-mr-sm"
              />
              <q-checkbox
                v-if="prop.node.type == 'super'"
                size="xs"
                v-model="prop.node.selected"
                @click="changeSelect(prop.node.name)"
              />

              <div class="text-weight-bold text-positive">
                {{ prop.node.name }}
              </div>
            </div>
            <div v-if="!prop.node.icon" class="row items-center">
              <div class="text-weight-bold text-black">
                <q-checkbox
                  size="xs"
                  :disable="
                    prop.node.name == rawRoles.superadmin.toLowerCase() &&
                    !editable
                  "
                  v-model="prop.node.selected"
                  @click="changeSelect(prop.node.name)"
                />{{ prop.node.name }}
              </div>
            </div>
          </template>
        </q-tree>
      </q-card-section>
      <q-separator />
      <q-card-actions align="right">
        <q-btn :disable="!editable" color="primary" icon="save" @click="save"
          >save</q-btn
        >
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { AuthRole, User } from 'src/api/imported';
import { defineComponent, ref, PropType, computed, watchEffect } from 'vue';
import useRoles, { RoleState } from './useRoles';
import { useAuthStore } from 'stores/auth';

export default defineComponent({
  name: 'RolesDialog',
  props: {
    modelValue: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    user: {
      type: Object as PropType<User>,
      required: true,
    },
    roles: {
      type: Array as PropType<string[]>,
      required: true,
    },
  },
  emits: ['update:modelValue', 'roles:saved'],
  setup(props, { emit }) {
    const auth = useAuthStore();
    const opened = ref(false);
    const content = ref<AuthRole[]>([]);
    const ready = ref(false);
    const rawRoles = ref<RoleState>();
    const editable = ref(false);
    const { getRoles, getTree, selectRole, getSelectedRoles } = useRoles();

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

    const openDialog = async (_roles: string[]) => {
      rawRoles.value = await getRoles();
      const t = getTree(_roles);
      content.value = [t];
      editable.value = isEditable();
      opened.value = true;
      ready.value = true;
    };

    const changeSelect = (role: string) => {
      if (!editable.value) {
        return;
      }
      if (content.value) selectRole(content.value[0], role);
    };

    const isEditable = (): boolean => {
      if (props.user) {
        if (!rawRoles.value || !auth.user) return false;
        return (
          auth.user.roles.includes(rawRoles.value.superadmin) ||
          auth.user.roles.includes(rawRoles.value.rolesadmin)
        );
        //  todo add rolesadmin
      }
      return false;
    };

    const hide = () => {
      open.value = false;
    };

    const beforeShow = () => {
      ready.value = false;
      openDialog(props.roles);
    };

    const save = () => {
      const roles = getSelectedRoles(content.value[0]);
      console.log(roles);
      emit('roles:saved', roles, props.user.uuid);
      open.value = false;
    };

    return {
      opened,
      content,
      ready,
      open,
      rawRoles,
      editable,
      hide,
      beforeShow,
      changeSelect,
      save,
    };
  },
});
</script>
