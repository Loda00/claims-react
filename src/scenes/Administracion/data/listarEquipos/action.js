import fetchListaEquipos from 'scenes/Administracion/data/listarEquipos/api';
import { fetch } from 'services/api/actions';

export const FETCH_LIST_EQUIPOS_STARTED = 'Administracion/data/listarEquipos/FETCH_LIST_EQUIPOS_STARTED';
export const FETCH_LIST_EQUIPOS_FINISHED = 'Administracion/data/listarPersona/FETCH_LIST_EQUIPOS_FINISHED';
export const FETCH_LIST_EQUIPOS_RESET = 'Administracion/data/listarPersona/FETCH_LIST_EQUIPOS_RESET';

export function fetchListEquiposStarted() {
  return {
    type: FETCH_LIST_EQUIPOS_STARTED
  };
}

export function fetchListEquiposFinished(listarEquipos) {
  return {
    type: FETCH_LIST_EQUIPOS_FINISHED,
    payload: {
      listarEquipos
    }
  };
}

export function fetchListEquiposReset() {
  return {
    type: FETCH_LIST_EQUIPOS_RESET
  };
}

export function fetchListEquipos() {
  return dispatch =>
    new Promise((resolve, reject) => {
      dispatch(fetchListEquiposStarted());
      dispatch(fetch(fetchListaEquipos, {}))
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchListEquiposFinished(resp.data));
            resolve(resp);
          } else {
            dispatch(fetchListEquiposFinished([]));
            reject(resp.message);
          }
        })
        .catch(() => {
          dispatch(fetchListEquiposFinished([]));
        });
    });
}
