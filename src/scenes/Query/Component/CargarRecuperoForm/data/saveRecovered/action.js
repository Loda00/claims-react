import * as api from 'scenes/Query/Component/CargarRecuperoForm/data/saveRecovered/api';
import { fetch } from 'services/api/actions';

export const FETCH_SAVE_RECOVERED_STARTED =
  'Query/Component/CargarRecuperoForm/data/saveRecovered/FETCH_SAVE_RECOVERED_STARTED';
export const FETCH_SAVE_RECOVERED_FINISHED =
  'Query/Component/CargarRecuperoForm/data/saveRecovered/FETCH_SAVE_RECOVERED_FINISHED';
export const FETCH_SAVE_RECOVERED_RESET =
  'Query/Component/CargarRecuperoForm/data/saveRecovered/FETCH_SAVE_RECOVERED_RESET';

export function fetchSaveRecoveredStarted() {
  return {
    type: FETCH_SAVE_RECOVERED_STARTED
  };
}

export function fetchSaveRecoveredFinished(saveRecovered) {
  return {
    type: FETCH_SAVE_RECOVERED_FINISHED,
    payload: {
      saveRecovered
    }
  };
}

export function fetchSaveRecoveredReset() {
  return {
    type: FETCH_SAVE_RECOVERED_RESET
  };
}

export function fetchSaveRecovered(numSiniestro, recupero, rolUsuario) {
  return (dispatch, getState) =>
    new Promise(function(resolve, reject) {
      dispatch(fetchSaveRecoveredStarted());
      dispatch(fetch(api.fetchSaveRecovered, { numSiniestro, recupero, rolUsuario }))
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchSaveRecoveredFinished(resp.data));
            resolve(resp);
          } else {
            dispatch(fetchSaveRecoveredFinished([]));
            reject(resp.message);
          }
        })
        .catch(error => {
          dispatch(fetchSaveRecoveredFinished([]));
        });
    });
}
