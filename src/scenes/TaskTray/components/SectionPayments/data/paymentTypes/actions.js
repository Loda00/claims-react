import * as api from 'services/types/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';

import { getPaymentTypes } from 'scenes/TaskTray/components/SectionPayments/data/paymentTypes/reducer';

export const FETCH_PAYMENT_TYPES_STARTED =
  'scenes/TaskTray/components/SectionPayments/data/paymentTypes/FETCH_PAYMENT_TYPES_STARTED';
export const FETCH_PAYMENT_TYPES_SUCCEEDED =
  'scenes/TaskTray/components/SectionPayments/data/paymentTypes/FETCH_PAYMENT_TYPES_SUCCEEDED';
export const FETCH_PAYMENT_TYPES_FAILED =
  'scenes/TaskTray/components/SectionPayments/data/paymentTypes/FETCH_PAYMENT_TYPES_FAILED';
export const FETCH_PAYMENT_TYPES_RESET =
  'scenes/TaskTray/components/SectionPayments/data/paymentTypes/FETCH_PAYMENT_TYPES_RESET';

export function fetchPaymentTypesReset() {
  return {
    type: FETCH_PAYMENT_TYPES_RESET
  };
}

export function fetchPaymentTypesStarted() {
  return {
    type: FETCH_PAYMENT_TYPES_STARTED
  };
}

export function fetchPaymentTypesSucceeded(paymentTypes) {
  return {
    type: FETCH_PAYMENT_TYPES_SUCCEEDED,
    payload: {
      paymentTypes
    }
  };
}

export function fetchPaymentTypesFailed(error) {
  return {
    type: FETCH_PAYMENT_TYPES_FAILED,
    payload: error
  };
}

export function fetchPaymentTypes(ruta) {
  return (dispatch, getState) =>
    new Promise((resolve, reject) => {
      // if there is data not call API
      if (getPaymentTypes(getState()).paymentTypes.length > 0) return resolve();

      dispatch(fetchPaymentTypesStarted());
      dispatch(fetch(api.fetchTypes, { ruta }))
        .then(resp => {
          switch (resp.code) {
            case 'CRG-000':
              dispatch(fetchPaymentTypesSucceeded(resp.data));
              resolve(resp);
              break;
            default:
              dispatch(fetchPaymentTypesFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
              reject(resp.message);
          }
        })
        .catch(error => {
          dispatch(fetchPaymentTypesFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
          reject(error);
        });
    });
}
