import * as api from 'scenes/TaskTray/components/SectionPayments/data/payments/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';

// import { getPayments } from 'scenes/TaskTray/components/SectionPayments/data/payments/reducer';

export const FETCH_PAYMENTS_STARTED = 'AnalyzeSinisterInfo/data/payments/FETCH_PAYMENTS_STARTED';
export const FETCH_PAYMENTS_SUCCEEDED = 'AnalyzeSinisterInfo/data/payments/FETCH_PAYMENTS_SUCCEEDED';
export const FETCH_PAYMENTS_FAILED = 'AnalyzeSinisterInfo/data/payments/FETCH_PAYMENTS_FAILED';
export const FETCH_PAYMENTS_RESET = 'AnalyzeSinisterInfo/data/payments/FETCH_PAYMENTS_RESET';
export const MAINTAIN_PAYMENT_STARTED = 'AnalyzeSinisterInfo/data/payments/MAINTAIN_PAYMENT_STARTED';
export const MAINTAIN_PAYMENT_FINISHED = 'AnalyzeSinisterInfo/data/payments/MAINTAIN_PAYMENT_FINISHED';
export const SEND_PAYMENT_STARTED = 'AnalyzeSinisterInfo/data/payments/SEND_PAYMENT_STARTED';
export const SEND_PAYMENT_FINISHED = 'AnalyzeSinisterInfo/data/payments/SEND_PAYMENT_FINISHED';

export function fetchPaymentsStarted() {
  return {
    type: FETCH_PAYMENTS_STARTED
  };
}

export function fetchPaymentsSucceeded(payments) {
  return {
    type: FETCH_PAYMENTS_SUCCEEDED,
    payload: {
      payments
    }
  };
}

export function fetchPaymentsFailed(error) {
  return {
    type: FETCH_PAYMENTS_FAILED,
    payload: error
  };
}

export function fetchPaymentsReset() {
  return {
    type: FETCH_PAYMENTS_RESET
  };
}

export function maintainPaymentStarted() {
  return {
    type: MAINTAIN_PAYMENT_STARTED
  };
}

export function maintainPaymentFinished() {
  return {
    type: MAINTAIN_PAYMENT_FINISHED
  };
}

export function sendPaymentStarted() {
  return {
    type: SEND_PAYMENT_STARTED
  };
}

export function sendPaymentFinished(result) {
  return {
    type: SEND_PAYMENT_FINISHED,
    payload: {
      result
    }
  };
}

export function fetchPayments(params) {
  return dispatch =>
    new Promise((resolve, reject) => {
      dispatch(fetchPaymentsStarted());
      dispatch(fetch(api.fetchPayments, params))
        .then(resp => {
          switch (resp.code) {
            case 'CRG-000':
              dispatch(fetchPaymentsSucceeded(resp.data));
              resolve(resp);
              break;
            default:
              dispatch(
                fetchPaymentsFailed({
                  message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE
                })
              );
              reject(resp.message);
          }
        })
        .catch(() => {
          dispatch(
            fetchPaymentsFailed({
              message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE
            })
          );
          reject(CONSTANTS_APP.GENERIC_ERROR_MESSAGE);
        });
    });
}

export function maintainPayment(paymentType, accion, data) {
  return dispatch =>
    new Promise((resolve, reject) => {
      dispatch(maintainPaymentStarted());
      dispatch(fetch(api.maintainPayment, { paymentType, accion, data }))
        .then(resp => {
          switch (resp.code) {
            case 'CRG-000':
              dispatch(maintainPaymentFinished());
              resolve(resp);
              break;
            default:
              dispatch(maintainPaymentFinished());
              reject(resp.message);
          }
        })
        .catch(() => {
          dispatch(maintainPaymentFinished());
          reject(CONSTANTS_APP.GENERIC_ERROR_MESSAGE);
        });
    });
}

export function sendPayment(data) {
  return dispatch =>
    new Promise((resolve, reject) => {
      dispatch(sendPaymentStarted());
      dispatch(fetch(api.sendPayment, data))
        .then(resp => {
          switch (resp.code) {
            case 'CRG-000':
              dispatch(sendPaymentFinished());
              resolve(resp);
              break;
            default:
              dispatch(sendPaymentFinished());
              reject(resp.message);
          }
        })
        .catch(() => {
          dispatch(sendPaymentFinished());
          reject(CONSTANTS_APP.GENERIC_ERROR_MESSAGE);
        });
    });
}
