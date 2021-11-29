import * as api from 'services/types/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';

import { getAccountTypes } from 'scenes/TaskTray/components/SectionPayments/data/accountTypes/reducer';

export const FETCH_ACCOUNT_TYPES_STARTED =
  'scenes/TaskTray/components/SectionPayments/data/accountTypes/FETCH_ACCOUNT_TYPES_STARTED';
export const FETCH_ACCOUNT_TYPES_FINISHED =
  'scenes/TaskTray/components/SectionPayments/data/accountTypes/FETCH_ACCOUNT_TYPES_FINISHED';

export function fetchAccountTypesStarted() {
  return {
    type: FETCH_ACCOUNT_TYPES_STARTED
  };
}

export function fetchAccountTypesFinished(accountTypes) {
  return {
    type: FETCH_ACCOUNT_TYPES_FINISHED,
    payload: {
      accountTypes
    }
  };
}

export function fetchAccountTypes(ruta) {
  return (dispatch, getState) =>
    new Promise((resolve, reject) => {
      // if there is data not call API
      if (getAccountTypes(getState()).accountTypes.length > 0) return resolve();

      dispatch(fetchAccountTypesStarted());
      dispatch(fetch(api.fetchTypes, { ruta }))
        .then(resp => {
          switch (resp.code) {
            case 'CRG-000':
              dispatch(fetchAccountTypesFinished(resp.data));
              resolve(resp);
              break;
            default:
              dispatch(fetchAccountTypesFinished([]));
              reject(resp.message);
          }
        })
        .catch(() => {
          dispatch(fetchAccountTypesFinished([]));
          reject(CONSTANTS_APP.GENERIC_ERROR_MESSAGE);
        });
    });
}
