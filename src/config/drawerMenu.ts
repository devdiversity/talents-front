import { reactive } from 'vue';

export interface DrawerMenu {
  title: string;
  caption?: string;
  icon?: string;
  to?: string;
  command?: string;
  auth?: string[];
  children: DrawerMenu[];
}

export interface ConfigState {
  appTitle: string;
  userMenu: DrawerMenu;
  adminMenu: DrawerMenu;
  activityReport: number;
}

export const drawerMenu = reactive<ConfigState>({
  appTitle: 'The app',
  activityReport: 10,
  userMenu: {
    title: 'Account',
    icon: '',
    children: [
      {
        title: 'Profile',
        to: '/profile',
        children: [],
      },
    ],
  },
  adminMenu: {
    auth: ['superadmin'],
    title: 'Admin',
    icon: '',
    children: [
      {
        title: 'Users',
        icon: '',
        to: '/admin/users',
        children: [],
      },
      {
        title: 'Transactional Mails',
        icon: '',
        to: '/admin/transactionalmails',
        children: [],
      },
    ],
  },
});
