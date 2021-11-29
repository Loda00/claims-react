import * as api from 'services/types/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';

export const FETCH_CURRENCIES_STARTED = 'components/PriceInput/FETCH_CURRENCIES_STARTED';
export const FETCH_CURRENCIES_SUCCEEDED = 'components/PriceInput/FETCH_CURRENCIES_SUCCEEDED';
export const FETCH_CURRENCIES_FAILED = 'components/PriceInput/FETCH_CURRENCIES_FAILED';

export function fetchCurrenciesStarted() {
  return {
    type: FETCH_CURRENCIES_STARTED
  };
}

export function fetchCurrenciesSucceeded(currencies) {
  return {
    type: FETCH_CURRENCIES_SUCCEEDED,
    payload: {
      currencies
    }
  };
}

export function fetchCurrenciesFailed(error) {
  return {
    type: FETCH_CURRENCIES_FAILED,
    payload: error
  };
}

export const fetchCurrencies = () => dispatch =>
  new Promise((resolve, reject) => {
    dispatch(fetchCurrenciesStarted());
    dispatch(fetch(api.fetchTypes, { ruta: 'CRG_TVALOR_FACTURA' }))
      .then(resp => {
        if (resp.code === 'CRG-000') {
          dispatch(fetchCurrenciesSucceeded(resp.data));
          resolve(resp);
        } else {
          dispatch(
            fetchCurrenciesFailed({
              message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE
            })
          );
          reject(resp.message);
        }
      })
      .catch(error => {
        dispatch(
          fetchCurrenciesFailed({
            message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE
          })
        );
        reject(error);
      });
  });
