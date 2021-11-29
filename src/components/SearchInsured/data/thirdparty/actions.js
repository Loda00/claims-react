import * as api from 'components/SearchInsured/data/thirdparty/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';

export const FETCH_THIRD_PARTY_SUCCEEDED = 'SearchInsured/data/thirdparty/FETCH_THIRD_PARTY_SUCCEEDED';
export const FETCH_THIRD_PARTY_STARTED = 'SearchInsured/data/thirdparty/FETCH_THIRD_PARTY_STARTED';
export const FETCH_THIRD_PARTY_RESET = 'SearchInsured/data/thirdparty/FETCH_THIRD_PARTY_RESET';
export const FETCH_THIRD_PARTY_FAILED = 'SearchInsured/data/thirdparty/FETCH_THIRD_PARTY_FAILED';

export function fetchThirdPartyReset() {
  return {
    type: FETCH_THIRD_PARTY_RESET
  };
}

export function fetchThirdPartyStarted() {
  return {
    type: FETCH_THIRD_PARTY_STARTED
  };
}

export function fetchThirdPartySucceeded(thirdparty) {
  return {
    type: FETCH_THIRD_PARTY_SUCCEEDED,
    payload: {
      thirdparty
    }
  };
}

export function fetchThirdPartyFailed(error) {
  return {
    type: FETCH_THIRD_PARTY_FAILED,
    payload: error
  };
}

export const fetchThirdParty = (values, roleType, personType) => dispatch =>
  new Promise((resolve, reject) => {
    const data = {
      tipoRol: roleType,
      tipoDocumento: values.tipoDocumento ? values.tipoDocumento : '',
      numDocumento: values.numeroDocumento ? values.numeroDocumento : '',
      nombre: values.nombres ? values.nombres : '',
      apePaterno: values.apellidoPaterno ? values.apellidoPaterno : '',
      apeMaterno: values.apellidoMaterno ? values.apellidoMaterno : '',
      codExterno: '',
      numRegistros: 10,
      tipoCuenta: personType
    };

    dispatch(fetchThirdPartyStarted());
    dispatch(fetch(api.fetchThirdParty, data))
      .then(resp => {
        if (resp.code === 'CRG-000') {
          dispatch(fetchThirdPartySucceeded(resp.data));
          resolve(resp);
        } else {
          dispatch(fetchThirdPartyFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
          reject(resp);
        }
      })
      .catch(error => {
        dispatch(fetchThirdPartyFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
        reject(error);
      });
  });
