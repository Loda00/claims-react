import * as api from 'scenes/TaskTray/components/SectionPayments/data/entidades/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';

import { getEntidades } from 'scenes/TaskTray/components/SectionPayments/data/entidades/reducer';

export const FETCH_ENTIDADES_STARTED = 'AnalyzeSinisterInfo/data/entidades/FETCH_ENTIDADES_STARTED';
export const FETCH_ENTIDADES_FINISHED = 'AnalyzeSinisterInfo/data/entidades/FETCH_ENTIDADES_FINISHED';

export function fetchEntidadesStarted() {
  return {
    type: FETCH_ENTIDADES_STARTED
  };
}

export function fetchEntidadesFinished(entidades) {
  return {
    type: FETCH_ENTIDADES_FINISHED,
    payload: {
      entidades
    }
  };
}

export function fetchEntidades(indLista = 'S') {
  return (dispatch, getState) =>
    new Promise((resolve, reject) => {
      // if there is data not call API
      if (getEntidades(getState()).entidades.length === 0) {
        dispatch(fetchEntidadesStarted());
        dispatch(fetch(api.fetchEntidades, { indLista }))
          .then(resp => {
            switch (resp.code) {
              case 'CRG-000':
                dispatch(fetchEntidadesFinished(resp.data));
                return resolve(resp);
              default:
                dispatch(fetchEntidadesFinished([]));
                return reject(resp.message);
            }
          })
          .catch(() => {
            dispatch(fetchEntidadesFinished([]));
            return reject(CONSTANTS_APP.GENERIC_ERROR_MESSAGE);
          });
      }
    });
}
