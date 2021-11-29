import * as api from 'scenes/Query/Component/ConsultarSiniestro/data/listaEjecutivo/api';
import { fetch } from 'services/api/actions';

export const FETCH_LIST_EJECUTIVOS_STARTED =
  'Query/Component/ConsultarSiniestro/data/listaEjecutivo/FETCH_LIST_EJECUTIVOS_STARTED';
export const FETCH_LIST_EJECUTIVOS_FINISHED =
  'Query/Component/ConsultarSiniestro/data/listaEjecutivo/FETCH_LIST_EJECUTIVOS_FINISHED';
export const FETCH_LIST_EJECUTIVOS_RESET =
  'Query/Component/ConsultarSiniestro/data/listaEjecutivo/FETCH_LIST_EJECUTIVOS_RESET';

export function fetchListEjecutivoStarted() {
  return {
    type: FETCH_LIST_EJECUTIVOS_STARTED
  };
}

export function fetchListEjecutivoFinished(listaEjecutivo) {
  return {
    type: FETCH_LIST_EJECUTIVOS_FINISHED,
    payload: {
      listaEjecutivo
    }
  };
}

export function fetchListEjecutivoReset() {
  return {
    type: FETCH_LIST_EJECUTIVOS_RESET
  };
}

export function fetchListEjecutivo(values) {
  return (dispatch, getState) =>
    new Promise(function(resolve, reject) {
      dispatch(fetchListEjecutivoStarted());
      dispatch(fetch(api.fetchListEjecutivo, {}))
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchListEjecutivoFinished(resp.data));
            resolve(resp);
          } else {
            dispatch(fetchListEjecutivoFinished([]));
            reject(resp.message);
          }
        })
        .catch(error => {
          dispatch(fetchListEjecutivoFinished([]));
        });
    });
}
