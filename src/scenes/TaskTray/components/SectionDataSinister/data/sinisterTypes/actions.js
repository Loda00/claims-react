import * as api from 'services/types/api';
import { fetch } from 'services/api/actions';
import { getSinisterTypes } from 'scenes/TaskTray/components/SectionDataSinister/data/sinisterTypes/reducer';

export const FETCH_SINISTER_TYPES_STARTED =
  'scenes/TaskTray/components/SectionPayments/data/sinisterTypes/FETCH_SINISTER_TYPES_STARTED';

export const FETCH_SINISTER_TYPES_FINISHED =
  'scenes/TaskTray/components/SectionPayments/data/sinisterTypes/FETCH_SINISTER_TYPES_FINISHED';

export const FETCH_SINISTER_TYPES_RESET =
  'scenes/TaskTray/components/SectionPayments/data/sinisterTypes/FETCH_SINISTER_TYPES_RESET';

export function fetchSinisterTypesStarted() {
  return {
    type: FETCH_SINISTER_TYPES_STARTED
  };
}

export function fetchSinisterTypesFinished(sinisterTypes) {
  return {
    type: FETCH_SINISTER_TYPES_FINISHED,
    payload: {
      sinisterTypes
    }
  };
}

export function fetchSinisterTypesReset() {
  return {
    type: FETCH_SINISTER_TYPES_RESET
  };
}

export function fetchSinisterTypes(ruta) {
  return (dispatch, getState) =>
    new Promise((resolve, reject) => {
      // if there is data not call API
      if (getSinisterTypes(getState()).sinisterTypes.length > 0) return resolve();

      dispatch(fetchSinisterTypesStarted());
      dispatch(fetch(api.fetchTypes, { ruta }))
        .then(resp => {
          switch (resp.code) {
            case 'CRG-000':
              dispatch(fetchSinisterTypesFinished(resp.data));
              resolve(resp);
              break;
            default:
              dispatch(fetchSinisterTypesFinished([]));
              reject(resp.message);
          }
        })
        .catch(error => {
          dispatch(fetchSinisterTypesFinished([]));
          reject(error);
        });
    });
}
