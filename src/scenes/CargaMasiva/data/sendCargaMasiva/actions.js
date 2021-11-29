import * as api from 'scenes/CargaMasiva/data/sendCargaMasiva/api';
import { fetch } from 'services/api/actions';

export const FETCH_SEND_CARGAMASIVA_STARTED = 'CargaMasiva/data/dataCargaMasiva/FETCH_SEND_EXCEL_STARTED';
export const FETCH_SEND_CARGAMASIVA_FINISHED = 'CargaMasiva/data/dataCargaMasiva/FETCH_SEND_EXCEL_FINISHED';

export function validacionCargaMasivaIniciado() {
  return {
    type: FETCH_SEND_CARGAMASIVA_STARTED
  };
}

export function validacionCargaMasivaTerminado() {
  return {
    type: FETCH_SEND_CARGAMASIVA_FINISHED
    /* payload: {
      data
    } */
  };
}

export const fetchRegistrarCargaMasiva = body => dispatch =>
  new Promise((resolve, reject) => {
    dispatch(fetch(api.fetchRegistrarCargaMasiva, body))
      .then(response => {
        if (response.code === 'CRG-000') {
          // dispatch(validacionCargaMasivaTerminado(response.data));
          resolve(response);
        } else {
          resolve(response);
        }
      })
      .catch(error => {
        reject(error);
      });
  });
