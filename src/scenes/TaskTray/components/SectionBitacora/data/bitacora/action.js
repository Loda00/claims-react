/* eslint-disable no-console */
/* eslint-disable func-names */

import * as api from 'scenes/TaskTray/components/SectionBitacora/data/bitacora/api';
import { fetch } from 'services/api/actions';

export const FETCH_BITACORA_STARTED = 'SectionBitacora/data/bitacora/FETCH_BITACORA_STARTED';
export const FETCH_BITACORA_FINISHED = 'SectionBitacora/data/bitacora/FETCH_BITACORA_FINISHED';
export const FETCH_BITACORA_RESET = 'SectionBitacora/data/bitacora/FETCH_BITACORA_RESET';

export function fetchBitacoraStarted() {
  return {
    type: FETCH_BITACORA_STARTED
  };
}

export function fetchBitacoraFinished(bitacora) {
  return {
    type: FETCH_BITACORA_FINISHED,
    payload: {
      bitacora
    }
  };
}

export function fecthBitacoraReset() {
  return {
    type: FETCH_BITACORA_RESET
  };
}

export function fecthBitacora(numSiniestro) {
  return (dispatch, getState) =>
    new Promise(function(resolve, reject) {
      dispatch(fetchBitacoraStarted());
      dispatch(fetch(api.fecthBitacora, { numSiniestro }))
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchBitacoraFinished(resp.data));
            resolve(resp);
          } else {
            dispatch(fetchBitacoraFinished([]));
            reject(resp.message);
          }
        })
        .catch(error => {
          dispatch(fetchBitacoraFinished([]));
        });
    });
}
