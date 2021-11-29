import * as api from 'scenes/TaskTray/scenes/TaskTrayHome/data/taskTypes/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';

export const FETCH_TASK_TYPES_SUCCEEDED = 'TaskTrayHome/data/taskTypes/FETCH_TASK_TYPES_SUCCEEDED';
export const FETCH_TASK_TYPES_STARTED = 'TaskTrayHome/data/taskTypes/FETCH_TASK_TYPES_STARTED';
export const FETCH_TASK_TYPES_FAILED = 'TaskTrayHome/data/taskTypes/FETCH_TASK_TYPES_FAILED';

export function fetchTaskTypesStarted() {
  return {
    type: FETCH_TASK_TYPES_STARTED
  };
}

export function fetchTaskTypesSucceeded(taskTypes) {
  return {
    type: FETCH_TASK_TYPES_SUCCEEDED,
    payload: {
      taskTypes
    }
  };
}

export function fetchTaskTypesFailed(error) {
  return {
    type: FETCH_TASK_TYPES_FAILED,
    payload: error
  };
}

export const fetchTaskTypes = () => dispatch =>
  new Promise(function(resolve, reject) {
    dispatch(fetchTaskTypesStarted());
    dispatch(fetch(api.fetchTaskTypes, {}))
      .then(resp => {
        switch (resp.code) {
          case 'CRG-000':
            dispatch(fetchTaskTypesSucceeded(resp.data.tareas));
            break;
          default:
            dispatch(fetchTaskTypesFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
        }
        resolve(resp);
      })
      .catch(error => {
        dispatch(fetchTaskTypesFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
        reject(error);
      });
  });
