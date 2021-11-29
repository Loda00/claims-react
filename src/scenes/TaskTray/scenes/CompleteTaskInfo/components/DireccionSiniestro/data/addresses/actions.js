import * as api from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DireccionSiniestro/data/addresses/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';

export const FETCH_ADDRESSES_STARTED =
  'CompleteTaskInfo/components/DireccionSiniestro/data/addresses/FETCH_ADDRESSES_STARTED';
export const FETCH_ADDRESSES_SUCCEEDED =
  'CompleteTaskInfo/components/DireccionSiniestro/data/addresses/FETCH_ADDRESSES_SUCCEEDED';
export const FETCH_ADDRESSES_RESET =
  'CompleteTaskInfo/components/DireccionSiniestro/data/addresses/FETCH_ADDRESSES_RESET';
export const FETCH_ADDRESSES_FAILED =
  'CompleteTaskInfo/components/DireccionSiniestro/data/addresses/FETCH_ADDRESSES_FAILED';
export const UPDATE_SEARCH_TERM = 'CompleteTaskInfo/components/DireccionSiniestro/data/addresses/UPDATE_SEARCH_TERM';

export function fetchAddressesStarted() {
  return {
    type: FETCH_ADDRESSES_STARTED
  };
}

export function fetchAddressesSucceeded(addresses) {
  return {
    type: FETCH_ADDRESSES_SUCCEEDED,
    payload: {
      addresses
    }
  };
}

export function fetchAddressesFailed(error) {
  return {
    type: FETCH_ADDRESSES_FAILED,
    payload: error
  };
}

export function fetchAddressesReset() {
  return {
    type: FETCH_ADDRESSES_RESET
  };
}

export function updateSearchTerm(searchTerm) {
  return {
    type: UPDATE_SEARCH_TERM,
    payload: searchTerm
  };
}

export const fetchAddresses = idePol => dispatch =>
  new Promise((resolve, reject) => {
    dispatch(fetchAddressesStarted());
    dispatch(fetch(api.fetchAddresses, { idePol }))
      .then(resp => {
        switch (resp.code) {
          case 'CRG-000':
            dispatch(fetchAddressesSucceeded(resp.data));
            resolve(resp);
            break;
          case 'CRG-204':
            dispatch(fetchAddressesReset());
            break;
          default:
            dispatch(fetchAddressesFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
            reject(resp);
        }
      })
      .catch(error => {
        dispatch(fetchAddressesFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
        reject(error);
      });
  });
