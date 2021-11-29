import * as api from 'services/types/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';

import { getChargeTypes } from 'scenes/TaskTray/components/SectionPayments/data/chargeTypes/reducer';

export const FETCH_CHARGE_TYPES_STARTED =
  'scenes/TaskTray/components/SectionPayments/data/chargeTypes/FETCH_CHARGE_TYPES_STARTED';
export const FETCH_CHARGE_TYPES_SUCCEEDED =
  'scenes/TaskTray/components/SectionPayments/data/chargeTypes/FETCH_CHARGE_TYPES_SUCCEEDED';
export const FETCH_CHARGE_TYPES_RESET =
  'scenes/TaskTray/components/SectionPayments/data/chargeTypes/FETCH_CHARGE_TYPES_RESET';
export const FETCH_CHARGE_TYPES_FAILED =
  'scenes/TaskTray/components/SectionPayments/data/chargeTypes/FETCH_CHARGE_TYPES_FAILED';

export function fetchChargeTypesStarted() {
  return {
    type: FETCH_CHARGE_TYPES_STARTED
  };
}

export function fetchChargeTypesSucceeded(chargeTypes) {
  return {
    type: FETCH_CHARGE_TYPES_SUCCEEDED,
    payload: {
      chargeTypes
    }
  };
}

export function fetchChargeTypesFailed(error) {
  return {
    type: FETCH_CHARGE_TYPES_FAILED,
    payload: error
  };
}

export function fetchChargeTypesReset() {
  return {
    type: FETCH_CHARGE_TYPES_RESET
  };
}

export function fetchChargeTypes(ruta) {
  return (dispatch, getState) =>
    new Promise((resolve, reject) => {
      // if there is data not call API
      if (getChargeTypes(getState()).chargeTypes.length > 0) return resolve();

      dispatch(fetchChargeTypesStarted());
      dispatch(fetch(api.fetchTypes, { ruta }))
        .then(resp => {
          switch (resp.code) {
            case 'CRG-000':
              dispatch(fetchChargeTypesSucceeded(resp.data));
              resolve(resp);
              break;
            default:
              dispatch(fetchChargeTypesFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
              reject(resp.message);
          }
        })
        .catch(error => {
          dispatch(fetchChargeTypesFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
          reject(error);
        });
    });
}
