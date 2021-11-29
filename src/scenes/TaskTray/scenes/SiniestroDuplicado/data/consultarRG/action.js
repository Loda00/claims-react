import * as api from 'services/sinister/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';

export const FETCH_RG1_STARTED = 'FETCH_DATOS_INFORMES_RG1_STARTED';
export const FETCH_RG1_SUCCEEDED = 'FETCH_A_DATOS_INFORMES_RG1_SUCCEEDED';
export const FETCH_RG1_RESET = 'FET_DATOS_INFORMESCH_RG1_RESET';
export const FETCH_RG1_FAILED = 'FETC_DATOS_INFORMESH_RG1_FAILED';

export function fetchRG1Started() {
  return {
    type: FETCH_RG1_STARTED
  };
}

export function fetchRG1Succeeded(rg) {
  return {
    type: FETCH_RG1_SUCCEEDED,
    payload: {
      rg
    }
  };
}

export function fetchRG1Failed(error) {
  return {
    type: FETCH_RG1_RESET,
    payload: error
  };
}

export function fetchRG1Reset() {
  return {
    type: FETCH_RG1_RESET
  };
}

export const fetchRG = numSiniestro => {
  return dispatch =>
    new Promise((resolve, reject) => {
      dispatch(fetchRG1Started());
      dispatch(fetch(api.fetchSinister, { numSiniestro, tipoCanal: 'BZF' }))
        .then(resp => {
          dispatch(fetchRG1Succeeded(resp.data));
          resolve(resp);
        })
        .catch(error => {
          dispatch(fetchRG1Failed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
          reject(error);
        });
    });
};
