import { UserStatus } from 'src/api/imported';
import { ITableHeaderButton } from 'src/components/DataTable/types';

export const usersSchema = {
  name: 'users',
  title: 'Users',
  searchTextStrategy: 'and',
  headerLeft: {
    component: 'TableHeaderButtons',
    componentConfig: [
      {
        icon: 'person_add',
        label: 'users.adduser',
        color: 'primary',
        flat: false,
        round: false,
        size: 'sm',
        unelevated: true,
        action: 'adduser',
      },
    ] as ITableHeaderButton[],
  },
  headerConfig: {
    component: 'TableConfig',
    componentConfig: {},
  },
  columns: [
    {
      name: 'id',
      required: true,
      align: 'center',
      label: ' ',
      field: 'uuid',
      width: 30,
      component: 'TableMenu',
      componentConfig: [
        {
          icon: 'password',
          label: 'users.changepassword',
          color: 'primary',
          action: 'changepassword',
        },
        {
          icon: 'person_pin',
          label: 'users.avatar',
          color: 'primary',
          action: 'avatar',
        },
        {
          icon: 'badge',
          label: 'users.profile',
          color: 'primary',
          action: 'profile',
        },
        {
          icon: 'mark_email_read',
          label: 'users.sendinvitation',
          color: 'primary',
          action: 'sendinvitation',
        },
        {
          icon: 'forward_to_inbox',
          label: 'users.sendmessage',
          color: 'primary',
          action: 'sendmessage',
        },
      ],
    },
    {
      name: 'status',
      required: true,
      align: 'center',
      label: 'Status',
      field: 'status',
      width: 60,
      search: {
        component: 'TableSearchRadio',
        componentConfig: {
          options: [
            {
              icon: 'hourglass_empty',
              label: 'status.waiting',
              color: 'orange',
              value: UserStatus.WaitingAdv,
            },
            {
              icon: 'pan_tool',
              label: 'status.blocked',
              color: 'negative',
              value: UserStatus.Suspended,
            },
            {
              icon: 'cancel',
              label: 'status.banned',
              color: 'negative',
              value: UserStatus.Banned,
            },
            {
              icon: 'done',
              label: 'status.ok',
              color: 'positive',
              value: UserStatus.Operating,
            },
          ],
        },
      },
      component: 'TableStatus',
      componentConfig: {
        waiting: {
          icon: 'hourglass_empty',
          label: 'status.waiting',
          color: 'orange',
        },
        suspended: {
          icon: 'pan_tool',
          label: 'status.blocked',
          color: 'negative',
        },
        banned: {
          icon: 'cancel',
          label: 'status.banned',
          color: 'negative',
        },
        operating: {
          icon: 'done',
          label: 'status.ok',
          color: 'positive',
        },
      },
    },
    {
      name: 'email',
      required: true,
      label: 'User email',
      align: 'left',
      field: 'email',
      sortable: false,
      search: {
        component: 'TableTextSearch',
        componentConfig: {},
      },
      width: 200,
      headerClasses: 'super-sort',
    },
    {
      name: 'roles',
      required: true,
      align: 'left',
      label: 'Roles',
      field: 'roles',
      sortable: false,
      component: 'TableRoles',
      search: {
        component: 'TableSearchArray',
        componentConfig: {},
      },
      width: 160,
    },
    {
      name: 'created',
      visible: false,
      align: 'left',
      label: 'Created',
      field: 'createdAt',
      sortable: false,
      width: 160,
      component: 'TableDate',
      componentConfig: { format: 'MM/DD/YYYY HH:mm:ss' },
      search: {
        component: 'TableSearchDate',
        componentConfig: {
          format: 'MM/DD/YYYY',
        },
      },
    },
    {
      name: 'updated',
      visible: false,
      align: 'left',
      label: 'Updated',
      field: 'updatedAt',
      sortable: false,
      width: 160,
      component: 'TableDate',
      componentConfig: { format: 'MM/DD/YYYY HH:mm:ss' },
      search: {
        component: 'TableSearchDate',
        componentConfig: {
          format: 'MM/DD/YYYY',
        },
      },
    },
    {
      name: 'dummy',
      required: true,
      visible: true,
      label: '',
      field: 'id',
      format: () => '',
    },
  ],
};
