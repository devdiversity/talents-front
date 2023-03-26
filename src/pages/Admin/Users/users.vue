<template>
  <q-page class="row">
    <DataTable :key="tableKey" v-if="ready" :data="users" :schema="schema" @search="search" @action="action" />
    <ChangeUserPassword v-model="openPasswordDialog" :userRow="selectedRow" />
    <AvatarDialog v-model="openAvatar" :userId="userId" :adminMode="true" />
    <ProfileDialog v-model="openProfile" :user="selectedRow" @update="updateUserData" />
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';

import DataTable from 'components/DataTable/Table.vue';
import { usersSchema } from './usersSchema';
import { ITableSchema, IAction, ITableRow } from 'src/components/DataTable/types';

import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

import ChangeUserPassword from './changeUserPassword.vue';
import AvatarDialog from 'src/components/Images/AvatarDialog.vue';
import ProfileDialog from './ProfileDialog.vue';
import { Admin, Avatar, RolesForm, User, UserStatus } from 'src/api/imported';

export default defineComponent({
  name: 'UsersPage',
  components: {
    DataTable,
    ChangeUserPassword,
    AvatarDialog,
    ProfileDialog,
  },
  props: {
    title: {
      type: String,
      required: false,
    },
  },

  setup() {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { t } = useI18n();
    const $q = useQuasar();

    const schema = ref<ITableSchema>(usersSchema as ITableSchema);
    const ready = ref(false);
    const openPasswordDialog = ref(false);
    const openAvatar = ref<boolean>(false);
    const openProfile = ref<boolean>(false);
    const selectedRow = ref<ITableRow>({});
    const userId = ref<string>('');
    const users = ref<User[]>([]);
    let tableKey = 0;

    onMounted(async () => {
      const { data, error } = await Admin.FindAllUsers({
        page: 0,
        pagesize: 0,
      });
      if (error) {
        console.log(error);
      } else {
        users.value = data.users;
        ready.value = true;
      }
    });

    const search = (args: unknown) => {
      console.log(args);
    };

    const action = async (args: IAction) => {
      const { action, row, data } = args;
      switch (action) {
        case 'avatar':
          $q.dialog({
            title: t('dialogs.confirm'),
            message: t('avatar.dialog.remove'),
            cancel: t('dialogs.cancel'),
            ok: t('dialogs.ok'),
            persistent: true,
          }).onOk(async () => {
            const { error } = await Avatar.DeleteUserAvatar({
              UUID: row.uuid,
              avatar: '',
            });
            if (error) {
              $q.dialog({
                title: t('error'),
                message: t(error.text),
                persistent: true,
              });
            } else {
              $q.notify({
                color: 'positive',
                textColor: 'white',
                icon: 'thumb_up_off_alt',
                message: t('avatar.dialog.removed'),
                position: 'top-right',
                timeout: 3000,
              });
              row.status = status;
            }
          });

          break;
        case 'profile':
          selectedRow.value = row;
          openProfile.value = true;
          break;
        case 'changepassword':
          selectedRow.value = row;
          openPasswordDialog.value = true;
          break;
        case 'status':
          {
            const status = data as UserStatus;
            const { error } = await Admin.UpdateUserStatus({
              userUUID: row.uuid,
              status: status,
            });
            if (error) {
              $q.dialog({
                title: t('error'),
                message: t(error.text),
                persistent: true,
              });
            } else {
              $q.notify({
                color: 'positive',
                textColor: 'white',
                icon: 'thumb_up_off_alt',
                message: 'status updated successfully!',
                position: 'top-right',
                timeout: 3000,
              });
              row.status = status;
            }
          }
          break;
        case 'roles':
          {
            const roles = (data as string[]).map((v) => v.toLowerCase());
            const rolesForm: RolesForm = { userUUID: row.uuid, roles: roles };
            const { error } = await Admin.UpdateUserRoles(rolesForm);
            if (error) {
              $q.dialog({
                title: t('error'),
                message: t(error.text),
                persistent: true,
              });
            } else {
              $q.notify({
                color: 'positive',
                textColor: 'white',
                icon: 'thumb_up_off_alt',
                message: 'roles updated successfully!',
                position: 'top-right',
                timeout: 3000,
              });

              row.roles = roles as unknown as string;
            }
          }
          break;
      }
    };

    const updateUserData = (row: User) => {
      Object.assign(selectedRow.value, row);
    };

    return {
      users,
      schema,
      ready,
      openPasswordDialog,
      userId,
      openAvatar,
      openProfile,
      selectedRow,
      search,
      action,
      updateUserData,
      tableKey,
    };
  },
});
</script>
