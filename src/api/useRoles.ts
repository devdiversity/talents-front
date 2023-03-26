import { AuthRole, FlatRole, System } from './imported';
import { reactive, toRefs } from 'vue';

export interface RoleState {
  ready: boolean;
  roles: AuthRole;
  superadmin: string;
  rolesadmin: string;
  default: string;
  flatRoles: { [key: string]: FlatRole | null };
}

const state = reactive<RoleState>({
  ready: false,
  roles: <AuthRole>{},
  superadmin: '',
  rolesadmin: '',
  default: '',
  flatRoles: {},
});

export default function useRolers() {
  async function getRoles(): Promise<RoleState> {
    const { data, error } = await System.GetRoles();
    if (error) {
      throw new Error(error.text);
    }
    state.ready = true;
    state.roles = data.tree;
    state.superadmin = data.superadmin;
    state.rolesadmin = data.rolesadmin;
    state.default = data.default;
    state.flatRoles = data.roles;

    return state;
  }

  // ROLES

  function getRoleRoots(roles: string[]): { [key: string]: boolean } {
    const roots = <{ [key: string]: boolean }>{};
    roles.forEach((r) => {
      const role = state.flatRoles[r];
      if (role) {
        const ra = role.path.split('.');
        const rs = ra.slice().reverse();
        for (const x of rs) {
          const role = state.flatRoles[x];
          if (role) {
            break;
          }
        }
      }
    });
    return roots;
  }

  function getTree(roles: string[] = []): AuthRole {
    resetRolesTree(state.roles, roles);
    return state.roles;
  }

  const clearRolesChildren = (item: AuthRole) => {
    const select = (ro: AuthRole) => {
      if (ro.roles) {
        ro.roles.forEach((r) => {
          r.selected = false;
          select(r);
        });
      }
    };
    select(item);
  };

  const clearSuperadminRole = (item: AuthRole) => {
    const select = (ro: AuthRole) => {
      if (ro.roles) {
        ro.roles.forEach((r) => {
          if (ro.name == state.superadmin) ro.selected = false;
          select(r);
        });
      }
    };
    if (item.name?.toLowerCase() == state.superadmin) item.selected = false;
    select(item);
  };

  const selectRole = (role: AuthRole, value: string) => {
    const select = (ro: AuthRole, value: string, parent: AuthRole) => {
      if (ro.name == value && ro.selected) {
        clearRolesChildren(ro);
        if (parent) parent.selected = false;
        return;
      }

      if (ro.roles) {
        ro.roles.forEach((r) => {
          select(r, value, ro);
        });
      }
    };
    if (value.toLowerCase() !== state.superadmin) clearSuperadminRole(role);
    select(role, value, <AuthRole>{});
  };

  function resetRolesTree(role: AuthRole, roles: string[] = []) {
    const resetRole = (role: AuthRole, roles: string[]) => {
      if (role.roles) {
        role.roles.forEach((r) => {
          if (r.name && roles.includes(r.name.toLowerCase())) {
            r.selected = true;
          } else {
            r.selected = false;
          }
          resetRole(r, roles);
        });
      }
    };

    roles.includes(state.superadmin)
      ? (role.selected = true)
      : (role.selected = false);

    resetRole(role, roles);
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

    getRolesasHtml(state.roles, level, userRoles);
    return html + '</ul>';
  }

  const getSelectedRoles = (roles: AuthRole | undefined): string[] => {
    const result = <string[]>[];
    if (!roles) return result;
    const select = (ro: AuthRole) => {
      if (ro.selected && ro.name) {
        result.push(ro.name?.toLowerCase());
        return;
      }
      if (ro.roles) {
        ro.roles.forEach((r) => {
          select(r);
        });
      }
    };

    select(roles);

    return result;
  };

  return {
    ...toRefs(state),
    getRoles,
    getRoleRoots,
    getHTMLRolesTree,
    getSelectedRoles,
    clearRolesChildren,
    clearSuperadminRole,
    selectRole,
    getTree,
    resetRolesTree,
  };
}
