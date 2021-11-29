import fetchListaRoles from 'scenes/Administracion/data/listarRoles/api';
import { fetch } from 'services/api/actions';

export const FETCH_LIST_ROLES_STARTED = 'Administracion/data/listarRoles/FETCH_LIST_ROLES_STARTED';
export const FETCH_LIST_ROLES_FINISHED = 'Administracion/data/listarRoles/FETCH_LIST_ROLES_FINISHED';
export const FETCH_LIST_ROLES_RESET = 'Administracion/data/listarRoles/FETCH_LIST_ROLES_RESET';

export function fetchListRolesStarted() {
  return {
    type: FETCH_LIST_ROLES_STARTED
  };
}

export function fetchListRolesFinished(listarRoles) {
  return {
    type: FETCH_LIST_ROLES_FINISHED,
    payload: {
      listarRoles
    }
  };
}

export function fetchListRolesReset() {
  return {
    type: FETCH_LIST_ROLES_RESET
  };
}

export function fetchListRoles() {
  return dispatch =>
    new Promise((resolve, reject) => {
      dispatch(fetchListRolesStarted());
      dispatch(fetch(fetchListaRoles, {}))
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchListRolesFinished(resp.data));
            resolve();
          } else {
            dispatch(fetchListRolesFinished([]));
            reject(resp.message);
          }
        })
        .catch(() => {
          dispatch(fetchListRolesFinished([]));
        });
    });
}
