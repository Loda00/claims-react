import * as api from 'services/types/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';

export const FETCH_EVENT_TYPES_STARTED = 'TaskTray/scenes/CompleteTaskInfo/data/eventTypes/FETCH_EVENT_TYPES_STARTED';
export const FETCH_EVENT_TYPES_SUCCEEDED =
  'TaskTray/scenes/CompleteTaskInfo/data/eventTypes/FETCH_EVENT_TYPES_SUCCEEDED';
export const FETCH_EVENT_TYPES_FAILED = 'TaskTray/scenes/CompleteTaskInfo/data/eventTypes/FETCH_EVENT_TYPES_FAILED';
export const FETCH_EVENT_TYPES_RESET = 'TaskTray/scenes/CompleteTaskInfo/data/eventTypes/FETCH_EVENT_TYPES_RESET';

export function fetchEventTypesReset() {
  return {
    type: FETCH_EVENT_TYPES_RESET
  };
}

export function fetchEventTypesStarted() {
  return {
    type: FETCH_EVENT_TYPES_STARTED
  };
}

export function fetchEventTypesSucceeded(eventTypes) {
  return {
    type: FETCH_EVENT_TYPES_SUCCEEDED,
    payload: {
      eventTypes
    }
  };
}

export function fetchEventTypesFailed(error) {
  return {
    type: FETCH_EVENT_TYPES_FAILED,
    payload: error
  };
}

export const fetchEventTypes = ruta => dispatch =>
  new Promise(function(resolve, reject) {
    dispatch(fetchEventTypesStarted());
    dispatch(fetch(api.fetchTypes, { ruta }))
      .then(resp => {
        switch (resp.code) {
          case 'CRG-000':
            dispatch(fetchEventTypesSucceeded(resp.data));
            resolve(resp);
            break;
          default:
            dispatch(fetchEventTypesFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
            reject(resp.message);
        }
      })
      .catch(error => {
        dispatch(fetchEventTypesFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
        reject(error);
      });
  });
