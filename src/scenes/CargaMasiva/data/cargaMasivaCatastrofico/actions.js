import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';
import { fetchCargaMasiva } from './api';

export const FETCH_SEND_CARGAMASIVA_CATASTROFICO_STARTED = 'FETCH_SEND_EXCEL_STARTED_CARGA_MASIVA_CATASTROFICO';
export const FETCH_SEND_CARGAMASIVA_CATASTROFICO_FINISHED = 'FETCH_SEND_EXCEL_FINISHED_CARGA_MASIVA_CATASTROFICO';

export function registrarCargaMasivaStarted() {
  return {
    type: FETCH_SEND_CARGAMASIVA_CATASTROFICO_STARTED
  };
}
export function registrarCargaMasivaFinished(catastrofico) {
  return {
    type: FETCH_SEND_CARGAMASIVA_CATASTROFICO_FINISHED,
    payload: {
      catastrofico
    }
  };
}

export const fetchRegistrarCatastrofico = body => {
  return dispatch =>
    new Promise((resolve, reject) => {
      dispatch(registrarCargaMasivaStarted());
      dispatch(fetch(fetchCargaMasiva, body))
        .then(response => {
          dispatch(registrarCargaMasivaFinished(response.data));
          resolve(response);
        })
        .catch(() => {
          dispatch(registrarCargaMasivaFinished([]));
          reject(CONSTANTS_APP.GENERIC_ERROR_MESSAGE);
        });
    });
};
