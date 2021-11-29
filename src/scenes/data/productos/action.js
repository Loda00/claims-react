import * as api from 'scenes/data/productos/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';

export const FETCH_PRODUCTS_STARTED = 'scenes/data/productos/FETCH_PRODUCTS_STARTED';
export const FETCH_PRODUCTS_SUCCEEDED = 'scenes/data/productos/FETCH_PRODUCTS_SUCCEEDED';
export const FETCH_PRODUCTS_FAILED = 'scenes/data/productos/FETCH_PRODUCTS_FAILED';

export function fetchProductsStarted() {
  return {
    type: FETCH_PRODUCTS_STARTED
  };
}

export function fetchProductsSucceeded(producto) {
  return {
    type: FETCH_PRODUCTS_SUCCEEDED,
    payload: {
      producto
    }
  };
}

export function fetchProductsFailed(error) {
  return {
    type: FETCH_PRODUCTS_FAILED,
    payload: error
  };
}

export const fetchProducts = () => dispatch =>
  new Promise(function(resolve, reject) {
    dispatch(fetchProductsStarted());
    dispatch(fetch(api.fetchProducts, {}))
      .then(resp => {
        if (resp.code === 'CRG-000') {
          dispatch(fetchProductsSucceeded(resp.data));
          resolve(resp);
        } else {
          dispatch(fetchProductsFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
          reject(resp);
        }
      })
      .catch(error => {
        dispatch(fetchProductsFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
        reject(error);
      });
  });
