import * as api from 'scenes/TaskTray/components/SectionSalvamentoRecupero/data/listRecovered/api';
import { fetch } from 'services/api/actions';
// import { CONSTANTS_APP } from 'constants/index';

// import { getListRecovered } from 'scenes/Query/Component/CargarRecuperoForm/data/listRecovered/reducer'

export const FETCH_LIST_RECOVERED_STARTED =
  'TaskTray/components/SectionSalvamentoRecupero/data/listRecovered/FETCH_LIST_RECOVERED_STARTED';
export const FETCH_LIST_RECOVERED_FINISHED =
  'TaskTray/components/SectionSalvamentoRecupero/data/listRecovered/FETCH_LIST_RECOVERED_FINISHED';
export const FETCH_LIS_RECOVERED_RESET =
  'TaskTray/components/SectionSalvamentoRecupero/data/listRecovered/FETCH_LIS_RECOVERED_RESET';

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
      // if(getListRecovered(getState()).listRecovered.length > 0 ) return resolve();

      dispatch(fetchTListRecoveredStarted());
      dispatch(fetch(api.fetchListRecovered, { numeroSiniestro }))
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchListRecoveredFinished(resp.data));
            resolve();
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
