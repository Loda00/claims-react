import * as api from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DatosCobertura/data/branches/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';

export const UPDATE_SELECTED_BRANCH = 'CompleteTaskInfo/components/DatosCobertura/data/branches/UPDATE_SELECTED_BRANCH';
export const FETCH_BRANCHES_STARTED = 'CompleteTaskInfo/components/DatosCobertura/data/branches/FETCH_BRANCHES_STARTED';
export const FETCH_BRANCHES_SUCCEEDED =
  'CompleteTaskInfo/components/DatosCobertura/data/branches/FETCH_BRANCHES_SUCCEEDED';
export const FETCH_BRANCHES_RESET = 'CompleteTaskInfo/components/DatosCobertura/data/branches/FETCH_BRANCHES_RESET';
export const FETCH_BRANCHES_FAILED = 'CompleteTaskInfo/components/DatosCobertura/data/branches/FETCH_BRANCHES_FAILED';

export function updateSelectedBranch(selectedBranch) {
  return {
    type: UPDATE_SELECTED_BRANCH,
    payload: {
      selectedBranch
    }
  };
}

export function fetchBranchesStarted() {
  return {
    type: FETCH_BRANCHES_STARTED
  };
}

export function fetchBranchesSucceeded(branches) {
  return {
    type: FETCH_BRANCHES_SUCCEEDED,
    payload: {
      branches
    }
  };
}

export function fetchBranchesFailed(error) {
  return {
    type: FETCH_BRANCHES_FAILED,
    payload: error
  };
}

export function fetchBranchesReset() {
  return {
    type: FETCH_BRANCHES_RESET
  };
}

export function fetchBranches(idePol, numCert, ideDec) {
  return dispatch =>
    new Promise((resolve, reject) => {
      dispatch(fetchBranchesStarted());
      dispatch(fetch(api.fetchBranches, { idePol, numCert, ideDec }))
        .then(resp => {
          switch (resp.code) {
            case 'CRG-000':
              dispatch(fetchBranchesSucceeded(resp.data));
              resolve(resp);
              break;
            case 'CRG-204':
              dispatch(fetchBranchesReset());
              break;
            default:
              dispatch(fetchBranchesFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
              reject(resp);
          }
        })
        .catch(error => {
          dispatch(fetchBranchesFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
          reject(error);
        });
    });
}
