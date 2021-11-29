import * as api from 'scenes/TaskTray/components/SectionPayments/data/adjusters/api';
import { fetch } from 'services/api/actions';

import { getAdjusters } from 'scenes/TaskTray/components/SectionPayments/data/adjusters/reducer';

export const FETCH_ADJUSTERS_STARTED = 'AnalyzeSinisterInfo/data/adjusters/FETCH_ADJUSTERS_STARTED';
export const FETCH_ADJUSTERS_FINISHED = 'AnalyzeSinisterInfo/data/adjusters/FETCH_ADJUSTERS_FINISHED';
export const FETCH_ADJUSTERS_RESET = 'AnalyzeSinisterInfo/data/adjusters/FETCH_ADJUSTERS_RESET';
export const SET_COD_RAMO = 'AnalyzeSinisterInfo/data/adjusters/SET_COD_RAMO';

export function fetchAdjustersStarted() {
  return {
    type: FETCH_ADJUSTERS_STARTED
  };
}

export function fetchAdjustersFinished(codRamo, adjusters) {
  return {
    type: FETCH_ADJUSTERS_FINISHED,
    payload: {
      codRamo,
      adjusters
    }
  };
}

export function fetchAdjustersReset() {
  return {
    type: FETCH_ADJUSTERS_RESET
  };
}

export function setCodRamo(codRamo, idAjustadorSiniestro) {
  return {
    type: SET_COD_RAMO,
    payload: {
      codRamo,
      idAjustadorSiniestro
    }
  };
}

export function fetchAdjusters(params) {
  const { codRamo } = params;

  return (dispatch, getState) =>
    new Promise((resolve, reject) => {
      const adjusters = getAdjusters(getState());

      // if there is data not call API
      if ((adjusters.adjusters[codRamo] || []).length > 0) return resolve();

      dispatch(fetchAdjustersStarted());
      dispatch(fetch(api.fetchAdjusters, params))
        .then(resp => {
          switch (resp.code) {
            case 'CRG-000':
              dispatch(fetchAdjustersFinished(codRamo, resp.data));
              resolve(resp);
              break;
            default:
              dispatch(fetchAdjustersFinished(codRamo, []));
              reject(resp.message);
          }
        })
        .catch(error => {
          dispatch(fetchAdjustersFinished(codRamo, []));
          reject(error);
        });
    });
}
