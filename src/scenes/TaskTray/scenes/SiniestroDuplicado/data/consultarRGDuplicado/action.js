import * as api from 'services/sinister/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';

export const FETCH_RG1_DUPLICADO_STARTED = 'FETCH_RG1_DUPLICADO_STARTED';
export const FETCH_RG1_DUPLICADO_SUCCEEDED = 'FETCH_A_RG1_DUPLICADO_SUCCEEDED';
export const FETCH_RG1_DUPLICADO_RESET = 'FET_RG1_DUPLICADO_RESET';
export const FETCH_RG1_DUPLICADO_FAILED = 'FETC_RG1_DUPLICADO_FAILED';

export function fetchRGDuplicadoStarted() {
  return {
    type: FETCH_RG1_DUPLICADO_STARTED
  };
}

export function fetchRGDuplicadoSucceeded(duplicado) {
  return {
    type: FETCH_RG1_DUPLICADO_SUCCEEDED,
    payload: {
      duplicado
    }
  };
}

export function fetchRGDuplicadoFailed(error) {
  return {
    type: FETCH_RG1_DUPLICADO_FAILED,
    payload: error
  };
}

export function fetchRGDuplicadoReset() {
  return {
    type: FETCH_RG1_DUPLICADO_RESET
  };
}

export const fetchRGDuplicado = numSiniestro => {
  return dispatch =>
    new Promise((resolve, reject) => {
      dispatch(fetchRGDuplicadoStarted());
      dispatch(fetch(api.fetchSinister, { numSiniestro, tipoCanal: 'BZF' }))
        .then(resp => {
          dispatch(fetchRGDuplicadoSucceeded(resp.data));
          resolve(resp);
        })
        .catch(error => {
          dispatch(fetchRGDuplicadoFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
          reject(error);
        });
    });
};
