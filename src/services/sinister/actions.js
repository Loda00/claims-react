import * as api from 'services/sinister/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';
import * as uiActionCreators from 'services/ui/actions';

export const FETCH_SINISTER_STARTED = 'services/sinister/FETCH_SINISTER_STARTED';
export const FETCH_SINISTER_SUCCEEDED = 'services/sinister/sinister/FETCH_SINISTER_SUCCEEDED';
export const FETCH_SINISTER_FAILED = 'services/sinister/sinister/FETCH_SINISTER_FAILED';
export const SAVE_SINISTER_FAILED = 'services/sinister/SAVE_SINISTER_FAILED';

export function saveSinisterFailed(error) {
  return {
    type: SAVE_SINISTER_FAILED,
    payload: error
  };
}

export function fetchSinisterStarted() {
  return {
    type: FETCH_SINISTER_STARTED
  };
}

export function fetchSinisterSucceeded(sinister) {
  return {
    type: FETCH_SINISTER_SUCCEEDED,
    payload: {
      sinister
    }
  };
}

export function fetchSinisterFailed(error) {
  return {
    type: FETCH_SINISTER_FAILED,
    payload: error
  };
}

export const fetchSinister = numSiniestro => dispatch =>
  new Promise(function(resolve, reject) {
    dispatch(fetchSinisterStarted());
    dispatch(fetch(api.fetchSinister, { numSiniestro }))
      .then(resp => {
        switch (resp.code) {
          case 'CRG-000':
            dispatch(fetchSinisterSucceeded(resp.data));
            resolve(resp.data);
            break;
          default:
            dispatch(fetchSinisterFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
            reject(resp.message);
        }
      })
      .catch(error => {
        dispatch(fetchSinisterFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
        reject(error);
      });
  });

export const saveSinister = siniestro => dispatch =>
  new Promise(function(resolve, reject) {
    dispatch(uiActionCreators.switchLoader());
    dispatch(fetch(api.saveSinister, siniestro))
      .then(resp => {
        switch (resp.code) {
          case 'CRG-000':
            dispatch(uiActionCreators.switchLoader());
            resolve(resp.data);
            break;
          default:
            dispatch(saveSinisterFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
            dispatch(uiActionCreators.switchLoader());
            reject(resp.message);
        }
      })
      .catch(error => {
        dispatch(saveSinisterFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
        dispatch(uiActionCreators.switchLoader());
        reject(error);
      });
  });
