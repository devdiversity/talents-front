import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Home.vue') },
      {
        path: 'profile',
        component: () => import('pages/User/Profile.vue'),
      },
      { path: 'home', component: () => import('pages/Home.vue') },
    ],
  },
  {
    path: '/idle',
    name: 'idle',
    component: () => import('layouts/LoginLayout.vue'),
    children: [{ path: '', component: () => import('pages/Idle.vue') }],
  },
  {
    path: '/auth',
    component: () => import('layouts/LoginLayout.vue'),
    children: [
      { path: 'login', component: () => import('pages/Access/Access.vue') },
      { path: 'logout', component: () => import('pages/Access/Logout.vue') },
      {
        path: 'activate/:token',
        component: () => import('pages/Access/WelcomeToken.vue'),
      },
      {
        path: 'verify/:token',
        component: () => import('pages/Access/RecoverPasswordToken.vue'),
      },
    ],
  },
  {
    path: '/admin',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'users',
        component: () => import('src/pages/Admin/Users/users.vue'),
      },
      {
        path: 'transactionalmails',
        component: () => import('src/pages/Admin/TransactionalMails/Index.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
