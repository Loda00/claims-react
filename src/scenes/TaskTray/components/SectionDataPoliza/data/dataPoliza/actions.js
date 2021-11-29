import * as api from 'scenes/TaskTray/components/SectionDataPoliza/data/dataPoliza/api';
import { fetch } from 'services/api/actions';

export const FETCH_POLIZA_STARTED = 'SectionDataPoliza/data/dataPoliza/FETCH_POLIZA_STARTED';
export const FETCH_POLIZA_FINISHED = 'SectionDataPoliza/data/dataPoliza/FETCH_POLIZA_FINISHED';
export const FETCH_POLIZA_RESET = 'SectionDataPoliza/data/dataPoliza/FETCH_POLIZA_RESET';

export function fetchDataStarted() {
  return {
    type: FETCH_POLIZA_STARTED
  };
}

export function fetchDataFinished(data) {
  return {
    type: FETCH_POLIZA_FINISHED,
    payload: {
      isLoading: false,
      data
    }
  };
}

export function fetchPolizaReset() {
  return {
    type: FETCH_POLIZA_RESET
  };
}

export const fetchDataPoliza = numSiniestro => dispatch =>
  new Promise((resolve, reject) => {
    dispatch(fetchDataStarted());
    dispatch(fetch(api.fecthDataPoliza, { numSiniestro }))
      .then(resp => {
        switch (resp.code) {
          case 'CRG-000':
            dispatch(fetchDataFinished(resp.data));
            resolve(resp);
            break;
          default:
            dispatch(fetchDataFinished([]));
            reject(resp.message);
        }
      })
      .catch(error => {
        dispatch(fetchDataFinished([]));
        reject(error);
      });
  });
