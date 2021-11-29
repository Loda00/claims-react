import * as api from 'services/types/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';

import { getCoinTypes } from 'scenes/TaskTray/components/SectionPayments/data/coinTypes/reducer';

export const FETCH_COIN_TYPES_STARTED =
  'scenes/TaskTray/components/SectionPayments/data/coinTypes/FETCH_COIN_TYPES_STARTED';
export const FETCH_COIN_TYPES_SUCCEEDED =
  'scenes/TaskTray/components/SectionPayments/data/coinTypes/FETCH_COIN_TYPES_SUCCEEDED';
export const FETCH_COIN_TYPES_RESET =
  'scenes/TaskTray/components/SectionPayments/data/coinTypes/FETCH_COIN_TYPES_RESET';
export const FETCH_COIN_TYPES_FAILED =
  'scenes/TaskTray/components/SectionPayments/data/coinTypes/FETCH_COIN_TYPES_FAILED';

export function fetchCoinTypesStarted() {
  return {
    type: FETCH_COIN_TYPES_STARTED
  };
}

export function fetchCoinTypesSucceeded(coinTypes) {
  return {
    type: FETCH_COIN_TYPES_SUCCEEDED,
    payload: {
      coinTypes
    }
  };
}

export function fetchCoinTypesFailed(error) {
  return {
    type: FETCH_COIN_TYPES_FAILED,
    payload: error
  };
}

export function fetchCoinTypesReset() {
  return {
    type: FETCH_COIN_TYPES_RESET
  };
}

export function fetchCoinTypes(ruta) {
  return (dispatch, getState) =>
    new Promise((resolve, reject) => {
      // if there is data not call API
      if (getCoinTypes(getState()).coinTypes.length > 0) return resolve();

      dispatch(fetchCoinTypesStarted());
      dispatch(fetch(api.fetchTypes, { ruta }))
        .then(resp => {
          switch (resp.code) {
            case 'CRG-000':
              dispatch(fetchCoinTypesSucceeded(resp.data));
              resolve(resp);
              break;
            default:
              dispatch(fetchCoinTypesFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
              reject(resp.message);
          }
        })
        .catch(error => {
          dispatch(fetchCoinTypesFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
          reject(error);
        });
    });
}
