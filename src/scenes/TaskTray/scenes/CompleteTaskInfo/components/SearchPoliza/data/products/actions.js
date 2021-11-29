import * as api from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/SearchPoliza/data/products/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';

export const FETCH_PRODUCTS_STARTED = 'CompleteTaskInfo/components/SearchPoliza/data/products/FETCH_PRODUCTS_STARTED';
export const FETCH_PRODUCTS_SUCCEEDED =
  'CompleteTaskInfo/components/SearchPoliza/data/products/FETCH_PRODUCTS_SUCCEEDED';
export const FETCH_PRODUCTS_FAILED = 'CompleteTaskInfo/components/SearchPoliza/data/products/FETCH_PRODUCTS_FAILED';
export const FETCH_PRODUCTS_RESET = 'CompleteTaskInfo/components/SearchPoliza/data/products/FETCH_PRODUCTS_RESET';

export function fetchProductsReset() {
  return {
    type: FETCH_PRODUCTS_RESET
  };
}

export function fetchProductsStarted() {
  return {
    type: FETCH_PRODUCTS_STARTED
  };
}

export function fetchProductsSucceeded(products) {
  return {
    type: FETCH_PRODUCTS_SUCCEEDED,
    payload: {
      products
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
        switch (resp.code) {
          case 'CRG-000':
            dispatch(fetchProductsSucceeded(resp.data));
            break;
          default:
            dispatch(fetchProductsFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
        }
        resolve(resp);
      })
      .catch(error => {
        dispatch(fetchProductsFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
        reject(error);
      });
  });
