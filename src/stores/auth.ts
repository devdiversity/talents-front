import { defineStore } from 'pinia';
import { Users, avatars, Preferences, UserShort, backend } from 'src/api/imported';
import { idle } from 'src/boot/api';

export const useAuthStore = defineStore('auth', {
  state: () => {
    return {
      _user: null as UserShort | null,
      _isLogged: false,
      _refresh: Math.floor(Math.random() * 10000),
      _avatar: `${backend}/${avatars}defaultAvatar}.png`,
      _isIdle: false,
    };
  },
  getters: {
    isLogged(state) {
      return state._isLogged;
    },
    user(state) {
      return state._user;
    },
    avatar(state) {
      return `${backend}${state._avatar}?${state._refresh}`;
    },
    isIdle(state) {
      return state._isIdle;
    },
    preferences(state) {
      let p: Preferences;
      if (state._user && state._user.preferences) {
        p = state._user.preferences;
      } else {
        p = <Preferences>{
          useIdle: false,
          idleTimeout: 600,
          useIdlePassword: false,
          idlePin: '',
          useDirectLogin: false,
          useQuadcodeLogin: false,
          sendNoticesMail: false,
        };
      }
      return p;
    },
  },
  actions: {
    clear() {
      this._user = null;
      this._isLogged = false;
      this._avatar = `${avatars}defaultAvatar}.png`;
    },
    refresh() {
      this._refresh = Math.floor(Math.random() * 10000);
    },
    setDefaultAvatar() {
      this._avatar = `${avatars}defaultAvatar.png`;
    },
    setAvatar() {
      this._avatar = `${avatars}${this._user?.uuid}.png`;
    },
    async get() {
      try {
        this._user = null;
        this._isLogged = false;
        this._avatar = `${avatars}defaultAvatar}.png`;

        const { data, error } = await Users.WhoIm();
        if (error) {
          console.log(data, error);
          this._user = null;
          this._isLogged = false;
          return;
        }

        this._user = data;
        this._isLogged = true;
        this._avatar = `${avatars}${this._user?.uuid}.png`;
        const p = this._user?.preferences;
        idle.activityReportInSec = p.idleTimeout;
        idle.setTimer(p.idleTimeout * 1000);
      } catch (err) {
        console.log('Users.WhoIm error', err);
        return err;
      }
    },
    onResumeFromIdle() {
      this._isIdle = false;
    },
    onReportUserIsIdle() {
      this._isIdle = true;
    },
    getRoleAutorization(roles: string[]): boolean {
      if (!this._isLogged || !this._user) return false;
      if (this._user.roles.includes('superadmin')) return true;
      /*  let _route = 0;
      const _user = user.value.auth || (0 as number);
      roles.forEach((r) => {
        const role = state.system.roles[r];
        if (role) _route |= role.route;
      });
      return (_route & _user) != 0; */
      console.log(roles);
      return true;
    },
  },
});
