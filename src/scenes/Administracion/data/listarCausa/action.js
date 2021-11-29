import * as api from 'scenes/Administracion/data/listarCausa/api';
import { fetch } from 'services/api/actions';

export const FETCH_LIST_CAUSAS_STARTED = 'Administracion/data/listarCausa/FETCH_LIST_CAUSAS_STARTED';
export const FETCH_LIST_CAUSAS_FINISHED = 'Administracion/data/listarCausa/FETCH_LIST_CAUSAS_FINISHED';
export const FETCH_LIST_CAUSAS_RESET = 'Administracion/data/listarCausa/FETCH_LIST_CAUSAS_RESET';

export function fetchListCausaStarted() {
  return {
    type: FETCH_LIST_CAUSAS_STARTED
  };
}

export function fetchListCausaFinished(listarCausa) {
  return {
    type: FETCH_LIST_CAUSAS_FINISHED,
    payload: {
      listarCausa
    }
  };
}

export function fetchListPersonaReset() {
  return {
    type: FETCH_LIST_CAUSAS_RESET
  };
}

export function fetchListCausa(values) {
  return (dispatch, getState) =>
    new Promise(function(resolve, reject) {
      const { codigoCausas, dscCausas, ramoCausas } = values || {};
      const data = {
        codCausa: codigoCausas || null,
        dscCausa: dscCausas ? dscCausas.trim() : null,
        codRamo: ramoCausas || null
      };
      dispatch(fetchListCausaStarted());
      dispatch(fetch(api.fetchListCausa, data))
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchListCausaFinished(resp.data));
            resolve(resp);
          } else {
            dispatch(fetchListCausaFinished([]));
            reject(resp.message);
          }
        })
        .catch(error => {
          dispatch(fetchListCausaFinished([]));
        });
    });
}
