import * as api from 'services/types/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';

export const UPDATE_SELECTED_LOSSTYPE = 'TaskTray/scenes/CompleteTaskInfo/data/lossDetails/UPDATE_SELECTED_LOSSTYPE';
export const FETCH_LOSS_TYPES_STARTED = 'TaskTray/scenes/CompleteTaskInfo/data/lossDetails/FETCH_LOSS_TYPES_STARTED';
export const FETCH_LOSS_TYPES_SUCCEEDED =
  'TaskTray/scenes/CompleteTaskInfo/data/lossDetails/FETCH_LOSS_TYPES_SUCCEEDED';
export const FETCH_LOSS_TYPES_FAILED = 'TaskTray/scenes/CompleteTaskInfo/data/lossDetails/FETCH_LOSS_TYPES_FAILED';
export const FETCH_LOSS_TYPES_RESET = 'TaskTray/scenes/CompleteTaskInfo/data/lossDetails/FETCH_LOSS_TYPES_RESET';

export function updateSelectedLossType(selectedLossType) {
  return {
    type: UPDATE_SELECTED_LOSSTYPE,
    payload: {
      selectedLossType
    }
  };
}

export function fetchLossTypesStarted() {
  return {
    type: FETCH_LOSS_TYPES_STARTED
  };
}

export function fetchLossTypesSucceeded(lossTypes) {
  return {
    type: FETCH_LOSS_TYPES_SUCCEEDED,
    payload: {
      lossTypes
    }
  };
}

export function fetchLossTypesFailed(error) {
  return {
    type: FETCH_LOSS_TYPES_FAILED,
    payload: error
  };
}

export function fetchLossTypesReset() {
  return {
    type: FETCH_LOSS_TYPES_RESET
  };
}

export const fetchLossTypes = (ruta, prof) => dispatch =>
  new Promise(function(resolve, reject) {
    dispatch(fetchLossTypesStarted());
    dispatch(fetch(api.fetchTypes, { ruta, prof }))
      .then(resp => {
        switch (resp.code) {
          case 'CRG-000':
            dispatch(fetchLossTypesSucceeded(resp.data));
            resolve(resp);
            break;
          case 'CRG-204':
            dispatch(fetchLossTypesReset());
            reject(resp.message);
            break;
          default:
            dispatch(fetchLossTypesFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
            reject(resp.message);
        }
      })
      .catch(error => {
        dispatch(fetchLossTypesFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
        reject(error);
      });
  });
