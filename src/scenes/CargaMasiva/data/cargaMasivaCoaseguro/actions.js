import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';
import { fetchCargaMasiva } from './api';

export const FETCH_SEND_CARGAMASIVA_COASEGURO_STARTED = 'FETCH_SEND_EXCEL_STARTED_CARGA_MASIVA_COASEGURO';
export const FETCH_SEND_CARGAMASIVA_COASEGURO_FINISHED = 'FETCH_SEND_EXCEL_FINISHED_CARGA_MASIVA_COASEGURO';

export function registrarCargaMasivaCoaseguroStarted() {
  return {
    type: FETCH_SEND_CARGAMASIVA_COASEGURO_STARTED
  };
}

export function registrarCargaMasivaCoaseguroFinished(coaseguro) {
  return {
    type: FETCH_SEND_CARGAMASIVA_COASEGURO_FINISHED,
    payload: {
      coaseguro
    }
  };
}

export const fetchRegistrarCoaseguro = body => {
  return dispatch =>
    new Promise((resolve, reject) => {
      dispatch(registrarCargaMasivaCoaseguroStarted());
      dispatch(fetch(fetchCargaMasiva, body))
        .then(response => {
          dispatch(registrarCargaMasivaCoaseguroFinished(response.data));
          resolve(response);
        })
        .catch(() => {
          dispatch(registrarCargaMasivaCoaseguroFinished([]));
          reject(CONSTANTS_APP.GENERIC_ERROR_MESSAGE);
        });
    });
};
