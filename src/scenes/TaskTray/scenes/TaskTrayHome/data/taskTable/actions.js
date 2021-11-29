import * as api from 'scenes/TaskTray/scenes/TaskTrayHome/data/taskTable/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';

export const FETCH_TASK_TABLE_SUCCEEDED = 'TaskTrayHome/data/taskTable/FETCH_TASK_TABLE_SUCCEEDED';
export const FETCH_TASK_TABLE_STARTED = 'TaskTrayHome/data/taskTable/FETCH_TASK_TABLE_STARTED';
export const FETCH_TASK_TABLE_RESET = 'TaskTrayHome/data/taskTable/FETCH_TASK_TABLE_RESET';
export const FETCH_TASK_TABLE_FAILED = 'TaskTrayHome/data/taskTable/FETCH_TASK_TABLE_FAILED';
export const UPDATE_FILTER = 'TaskTrayHome/data/taskTable/UPDATE_FILTER';
export const UPDATE_TASK_TABLE_META = 'TaskTrayHome/data/taskTable/UPDATE_TASK_TABLE_META';
export const UPDATE_TAKEN_TASK = 'TaskTrayHome/data/taskTable/UPDATE_TAKEN_TASK';
export const UPDATE_TASK_TABLE_SORT_COLUMN = 'TaskTrayHome/data/taskTable/UPDATE_TASK_TABLE_SORT_COLUMN';

export function updateTakenTask(numSiniestro) {
  return {
    type: UPDATE_TAKEN_TASK,
    payload: numSiniestro
  };
}

export function updateFilter(filters) {
  return {
    type: UPDATE_FILTER,
    payload: filters
  };
}

export function fetchTaskTableStarted() {
  return {
    type: FETCH_TASK_TABLE_STARTED
  };
}

export function fetchTaskTableSucceeded(payload) {
  return {
    type: FETCH_TASK_TABLE_SUCCEEDED,
    ...payload
  };
}

export function fetchTaskTableFailed(error) {
  return {
    type: FETCH_TASK_TABLE_FAILED,
    payload: error
  };
}

export function fetchTaskTableReset() {
  return {
    type: FETCH_TASK_TABLE_RESET
  };
}

export function updatePage(page = 1) {
  return {
    type: UPDATE_TASK_TABLE_META,
    meta: {
      page
    }
  };
}

export function updateSortColumn(sortColumn) {
  return {
    type: UPDATE_TASK_TABLE_SORT_COLUMN,
    sortColumn
  };
}

export const fetchTaskTable = values => dispatch =>
  new Promise(function(resolve, reject) {
    dispatch(fetchTaskTableStarted());
    dispatch(fetch(api.fetchTaskTable, values))
      .then(resp => {
        switch (resp.code) {
          case 'CRG-000':
            dispatch(
              fetchTaskTableSucceeded({
                data: resp.data,
                meta: {
                  page: resp.paginacion.numPag,
                  pageSize: resp.paginacion.tamPag,
                  total: resp.paginacion.totalItems
                }
              })
            );
            resolve(resp);
            break;
          case 'CRG-204':
            dispatch(fetchTaskTableReset());
            resolve(resp);
            break;
          default:
            dispatch(fetchTaskTableFailed({ message: resp.message }));
            reject(resp.message);
        }
      })
      .catch(error => {
        dispatch(fetchTaskTableFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
        reject(CONSTANTS_APP.GENERIC_ERROR_MESSAGE);
      });
  });
