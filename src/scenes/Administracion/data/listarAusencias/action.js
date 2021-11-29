import fetchListaAusencias from 'scenes/Administracion/data/listarAusencias/api';
import { fetch } from 'services/api/actions';

export const FETCH_LIST_AUSENCIAS_STARTED = 'Administracion/data/listarAusencias/FETCH_LIST_AUSENCIAS_STARTED';
export const FETCH_LIST_AUSENCIAS_FINISHED = 'Administracion/data/listarAusencias/FETCH_LIST_AUSENCIAS_FINISHED';
export const FETCH_LIST_AUSENCIAS_RESET = 'Administracion/data/listarAusencias/FETCH_LIST_AUSENCIAS_RESET';

export function fetchListarAusenciasStarted() {
  return {
    type: FETCH_LIST_AUSENCIAS_STARTED
  };
}

export function fetchListarAusenciasFinished(listarAusencias) {
  return {
    type: FETCH_LIST_AUSENCIAS_FINISHED,
    payload: {
      listarAusencias
    }
  };
}

export function fetchListarAusenciasReset() {
  return {
    type: FETCH_LIST_AUSENCIAS_RESET
  };
}

export function fetchListarAusencias(crgPersona) {
  return dispatch =>
    new Promise((resolve, reject) => {
      const data = {
        crgPersona
      };
      dispatch(fetchListarAusenciasStarted());
      dispatch(fetch(fetchListaAusencias, data))
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchListarAusenciasFinished(resp.data));
            resolve(resp);
          } else {
            dispatch(fetchListarAusenciasFinished([]));
            reject(resp.message);
          }
        })
        .catch(() => {
          dispatch(fetchListarAusenciasFinished([]));
        });
    });
}
