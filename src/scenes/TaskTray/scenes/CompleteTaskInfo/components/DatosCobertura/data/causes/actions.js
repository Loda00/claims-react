import * as api from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DatosCobertura/data/causes/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';

export const FETCH_CAUSES_STARTED = 'CompleteTaskInfo/components/DatosCobertura/data/causes/FETCH_CAUSES_STARTED';
export const FETCH_CAUSES_SUCCEEDED = 'CompleteTaskInfo/components/DatosCobertura/data/causes/FETCH_CAUSES_SUCCEEDED';
export const FETCH_CAUSES_RESET = 'CompleteTaskInfo/components/DatosCobertura/data/causes/FETCH_CAUSES_RESET';
export const FETCH_CAUSES_FAILED = 'CompleteTaskInfo/components/DatosCobertura/data/causes/FETCH_CAUSES_FAILED';

export function fetchCausesStarted() {
  return {
    type: FETCH_CAUSES_STARTED
  };
}

export function fetchCausesSucceeded(causes) {
  return {
    type: FETCH_CAUSES_SUCCEEDED,
    payload: {
      causes
    }
  };
}

export function fetchCausesFailed(error) {
  return {
    type: FETCH_CAUSES_FAILED,
    payload: error
  };
}

export function fetchCausesReset() {
  return {
    type: FETCH_CAUSES_RESET
  };
}

export function fetchCauses(codRamo) {
  return dispatch =>
    new Promise((resolve, reject) => {
      dispatch(fetchCausesStarted());
      dispatch(fetch(api.fetchCauses, { codRamo }))
        .then(resp => {
          switch (resp.code) {
            case 'CRG-000':
              dispatch(fetchCausesSucceeded(resp.data));
              resolve(resp);
              break;
            case 'CRG-204':
              dispatch(fetchCausesReset());
              break;
            default:
              dispatch(fetchCausesFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
              reject(resp);
          }
        })
        .catch(error => {
          dispatch(fetchCausesFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
          reject(error);
        });
    });
}
