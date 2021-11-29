/* eslint-disable no-console */
/* eslint-disable func-names */

import * as api from 'scenes/components/Anular/data/anularSiniestro/api';

import { fetch } from 'services/api/actions';

export const FETCH_ANULAR_STARTED = 'FETCH_ANULAR_STARTED';
export const FETCH_ANULAR_FINISHED = 'FETCH_ANULAR_FINISHED';
export const FETCH_ANULAR_RESET = 'FETCH_ANULAR_RESET';

export function fetchAnularSiniestroStarted() {
  return {
    type: FETCH_ANULAR_STARTED
  };
}

export function fetchAnularSiniestroFinished(anular) {
  return {
    type: FETCH_ANULAR_FINISHED,
    payload: {
      anular
    }
  };
}

export function fecthAnularSiniestroReset() {
  return {
    type: FETCH_ANULAR_RESET
  };
}

export function fecthAnularSiniestro(numSiniestro, codMotivo, numId, txtMotivo, idUsuarioBizagi) {
  return (dispatch, getState) =>
    new Promise(function(resolve, reject) {
      dispatch(fetchAnularSiniestroStarted());
      dispatch(fetch(api.fecthAnularSiniestro, { numSiniestro, codMotivo, numId, txtMotivo, idUsuarioBizagi }))
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchAnularSiniestroFinished(resp.data));
            resolve(resp);
          } else {
            dispatch(fetchAnularSiniestroFinished([]));
            resolve(resp);
          }
        })
        .catch(error => {
          dispatch(fetchAnularSiniestroFinished([]));
          reject(error);
        });
    });
}
