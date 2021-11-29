/* eslint-disable no-console */
/* eslint-disable func-names */

import * as api from 'scenes/Query/Component/Reaperturar/data/reaperturarSiniestro/api';

import { fetch } from 'services/api/actions';

export const FETCH_REAPERTURAR_STARTED = 'FETCH_REAPERTURAR_STARTED';
export const FETCH_REAPERTURAR_FINISHED = 'FETCH_REAPERTURAR_FINISHED';
export const FETCH_REAPERTURAR_RESET = 'FETCH_REAPERTURAR_RESET';

export function fetchReaperturarSiniestroStarted() {
  return {
    type: FETCH_REAPERTURAR_STARTED
  };
}

export function fetchReaperturarSiniestroFinished(reaperturar) {
  return {
    type: FETCH_REAPERTURAR_FINISHED,
    payload: {
      reaperturar
    }
  };
}

export function fetchReaperturarSiniestroReset() {
  return {
    type: FETCH_REAPERTURAR_RESET
  };
}

export function fecthReaperturarSiniestro(numSiniestro, codMotivo, numId, descMotivo, idUsuarioBizagi) {
  return (dispatch, getState) =>
    new Promise(function(resolve, reject) {
      dispatch(fetchReaperturarSiniestroStarted());
      dispatch(fetch(api.fecthReaperturarSiniestro, { numSiniestro, codMotivo, numId, descMotivo, idUsuarioBizagi }))
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchReaperturarSiniestroFinished(resp.data));
            resolve(resp);
          } else {
            dispatch(fetchReaperturarSiniestroFinished([]));
            resolve(resp);
          }
        })
        .catch(error => {
          dispatch(fetchReaperturarSiniestroFinished([]));
          reject(error);
        });
    });
}
