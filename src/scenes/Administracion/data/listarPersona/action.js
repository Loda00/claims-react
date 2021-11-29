import fetchListaPersona from 'scenes/Administracion/data/listarPersona/api';
import { fetch } from 'services/api/actions';

export const FETCH_LIST_USUARIOS_STARTED = 'Administracion/data/listarPersona/FETCH_LIST_USUARIOS_STARTED';
export const FETCH_LIST_USUARIOS_FINISHED = 'Administracion/data/listarPersona/FETCH_LIST_USUARIOS_FINISHED';
export const FETCH_LIST_USUARIO_RESET = 'Administracion/data/listarPersona/FETCH_LIST_USUARIO_RESET';

export function fetchListPersonaStarted() {
  return {
    type: FETCH_LIST_USUARIOS_STARTED
  };
}

export function fetchListPersonaFinished(listarPersona) {
  return {
    type: FETCH_LIST_USUARIOS_FINISHED,
    payload: {
      listarPersona
    }
  };
}

export function fetchListPersonaReset() {
  return {
    type: FETCH_LIST_USUARIO_RESET
  };
}

export function fetchListPersona(values) {
  return dispatch =>
    new Promise((resolve, reject) => {
      const { nombre, apelidoPaterno, apelidoMaterno, cargo, equipo, email } = values || {};
      const data = {
        nombres: nombre || null,
        apePaterno: apelidoPaterno || null,
        apeMaterno: apelidoMaterno || null,
        crgCargo: cargo ? parseInt(cargo, 10) : null,
        crgEquipo: equipo ? parseInt(equipo, 10) : null,
        email: email || null
      };
      dispatch(fetchListPersonaStarted());
      dispatch(fetch(fetchListaPersona, data))
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchListPersonaFinished(resp.data));
            resolve(resp);
          } else {
            dispatch(fetchListPersonaFinished([]));
            reject(resp.message);
          }
        })
        .catch(() => {
          dispatch(fetchListPersonaFinished([]));
        });
    });
}
