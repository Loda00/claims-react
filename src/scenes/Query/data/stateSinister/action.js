import * as api from 'scenes/Query/data/stateSinister/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';

export const FETCH_STATE_SINISTER_STARTED = 'Query/data/stateSinister/FETCH_STATE_SINISTER_STARTED';
export const FETCH_STATE_SINISTER_SUCCEEDED = 'Query/data/stateSinister/FETCH_STATE_SINISTER_SUCCEEDED';
export const FETCH_STATE_SINISTER_FAILED = 'Query/data/stateSinister/FETCH_STATE_SINISTER_FAILED';

export function fetchStateSinisterStarted() {
  return {
    type: FETCH_STATE_SINISTER_STARTED
  };
}

export function fetchStateSinisterSucceeded(stateSinister) {
  return {
    type: FETCH_STATE_SINISTER_SUCCEEDED,
    payload: {
      stateSinister
    }
  };
}

export function fetchStateSinisterFailed(error) {
  return {
    type: FETCH_STATE_SINISTER_FAILED,
    payload: error
  };
}

export const fetchStateSinister = () => dispatch =>
  new Promise(function(resolve, reject) {
    dispatch(fetchStateSinisterStarted());
    dispatch(fetch(api.fetchStateSinister, {}))
      .then(resp => {
        if (resp.code === 'CRG-000') {
          dispatch(fetchStateSinisterSucceeded(resp.data));
          resolve(resp);
        } else {
          dispatch(fetchStateSinisterFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
          reject(resp);
        }
      })
      .catch(error => {
        dispatch(fetchStateSinisterFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
        reject(error);
      });
  });
