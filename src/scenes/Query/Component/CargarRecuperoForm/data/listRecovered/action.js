import * as api from 'scenes/Query/Component/CargarRecuperoForm/data/listRecovered/api';
import { fetch } from 'services/api/actions';

export const FETCH_LIST_RECOVERED_STARTED =
  'Query/Component/CargarRecuperoForm/data/listRecovered/FETCH_LIST_RECOVERED_STARTED';
export const FETCH_LIST_RECOVERED_FINISHED =
  'Query/Component/CargarRecuperoForm/data/listRecovered/FETCH_LIST_RECOVERED_FINISHED';
export const FETCH_LIS_RECOVERED_RESET =
  'Query/Component/CargarRecuperoForm/data/listRecovered/FETCH_LIS_RECOVERED_RESET';

export function fetchTListRecoveredStarted() {
  return {
    type: FETCH_LIST_RECOVERED_STARTED
  };
}

export function fetchListRecoveredFinished(listRecovered) {
  return {
    type: FETCH_LIST_RECOVERED_FINISHED,
    payload: {
      listRecovered
    }
  };
}

export function fetchListRecoveredReset() {
  return {
    type: FETCH_LIS_RECOVERED_RESET
  };
}

export function fetchListRecovered(numeroSiniestro) {
  return (dispatch, getState) =>
    new Promise(function(resolve, reject) {
      dispatch(fetchTListRecoveredStarted());
      dispatch(fetch(api.fetchListRecovered, { numeroSiniestro }))
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchListRecoveredFinished(resp.data));
            resolve(resp);
          } else {
            dispatch(fetchListRecoveredFinished([]));
            reject(resp.message);
          }
        })
        .catch(error => {
          dispatch(fetchListRecoveredFinished([]));
        });
    });
}
