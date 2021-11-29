import * as api from 'scenes/Administracion/data/listarConsecuencia/api';
import { fetch } from 'services/api/actions';

export const FETCH_LIST_CONSECUENCIAS_STARTED =
  'Administracion/data/listarConsecuencia/FETCH_LIST_CONSECUENCIAS_STARTED';
export const FETCH_LIST_CONSECUENCIAS_FINISHED =
  'Administracion/data/listarConsecuencia/FETCH_LIST_CONSECUENCIAS_FINISHED';
export const FETCH_LIST_CONSECUENCIA_RESET = 'Administracion/data/listarConsecuencia/FETCH_LIST_CONSECUENCIA_RESET';

export function fetchListConsecuenciaStarted() {
  return {
    type: FETCH_LIST_CONSECUENCIAS_STARTED
  };
}

export function fetchListConsecuenciaFinished(listarConsecuencia) {
  return {
    type: FETCH_LIST_CONSECUENCIAS_FINISHED,
    payload: {
      listarConsecuencia
    }
  };
}

export function fetchListConsecuenciaReset() {
  return {
    type: FETCH_LIST_CONSECUENCIA_RESET
  };
}

export function fetchListConsecuencia(values) {
  return (dispatch, getState) =>
    new Promise(function(resolve, reject) {
      const { codigoConsecuencia, descConsecuencia, ramoConsecuencia } = values || {};
      const data = {
        codConsecuencia: codigoConsecuencia || null,
        dscConsecuencia: descConsecuencia ? descConsecuencia.trim() : null,
        codRamo: ramoConsecuencia || null
      };
      dispatch(fetchListConsecuenciaStarted());
      dispatch(fetch(api.fetchListConsecuencia, data))
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchListConsecuenciaFinished(resp.data));
            resolve(resp);
          } else {
            dispatch(fetchListConsecuenciaFinished([]));
            reject(resp.message);
          }
        })
        .catch(error => {
          dispatch(fetchListConsecuenciaFinished([]));
        });
    });
}
