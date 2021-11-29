import * as api from 'scenes/TaskTray/scenes/CompleteTaskInfo/data/adjusters/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';

export const FETCH_ADJUSTERS_STARTED = 'CompleteTaskInfo/data/consequences/FETCH_ADJUSTERS_STARTED';
export const FETCH_ADJUSTERS_SUCCEEDED = 'CompleteTaskInfo/data/consequences/FETCH_ADJUSTERS_SUCCEEDED';
export const FETCH_ADJUSTERS_RESET = 'CompleteTaskInfo/data/consequences/FETCH_ADJUSTERS_RESET';
export const FETCH_ADJUSTERS_FAILED = 'CompleteTaskInfo/data/consequences/FETCH_ADJUSTERS_FAILED';

export function fetchAdjustersStarted() {
  return {
    type: FETCH_ADJUSTERS_STARTED
  };
}

export function fetchAdjustersSucceeded(adjusters) {
  return {
    type: FETCH_ADJUSTERS_SUCCEEDED,
    payload: {
      adjusters
    }
  };
}

export function fetchAdjustersFailed(error) {
  return {
    type: FETCH_ADJUSTERS_FAILED,
    payload: error
  };
}

export function fetchAdjustersReset() {
  return {
    type: FETCH_ADJUSTERS_RESET
  };
}

export function fetchAdjusters(codRamo) {
  return dispatch =>
    new Promise(function(resolve, reject) {
      dispatch(fetchAdjustersStarted());
      dispatch(fetch(api.fetchAdjusters, { codRamo, indAleatorio: 'N', origen: 'reporte' }))
        .then(resp => {
          switch (resp.code) {
            case 'CRG-000':
              dispatch(fetchAdjustersSucceeded(resp.data));
              resolve(resp);
              break;
            case 'CRG-204':
              dispatch(fetchAdjustersReset());
              reject(resp.message);
              break;
            default:
              dispatch(fetchAdjustersFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
              reject(resp.message);
          }
        })
        .catch(error => {
          dispatch(fetchAdjustersFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
          reject(error);
        });
    });
}
