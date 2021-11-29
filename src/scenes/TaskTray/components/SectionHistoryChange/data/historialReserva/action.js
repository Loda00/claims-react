/* eslint-disable no-console */
/* eslint-disable func-names */

import * as api from 'scenes/TaskTray/components/SectionHistoryChange/data/historialReserva/api';

import { fetch } from 'services/api/actions';

export const FETCH_HISTORIAL_RESERVA_STARTED =
  'SectionHistoryChange/data/historialReserva/FETCH_HISTORIAL_RESERVA_STARTED';
export const FETCH_HISTORIAL_RESERVA_FINISHED =
  'SectionHistoryChange/data/historialReserva/FETCH_HISTORIAL_RESERVA_FINISHED';
export const FETCH_HISTORIAL_RESERVA_RESET = 'SectionHistoryChange/data/historialReserva/FETCH_HISTORIAL_RESERVA_RESET';

export function fetchHistorialReservaStarted() {
  return {
    type: FETCH_HISTORIAL_RESERVA_STARTED
  };
}

export function fetchHistorialReservaFinished(historialReserva) {
  return {
    type: FETCH_HISTORIAL_RESERVA_FINISHED,
    payload: {
      historialReserva
    }
  };
}

export function fecthHistorialReservaReset() {
  return {
    type: FETCH_HISTORIAL_RESERVA_RESET
  };
}

export function fecthHistorialReserva(numSiniestro) {
  return (dispatch, getState) =>
    new Promise(function(resolve, reject) {
      dispatch(fetchHistorialReservaStarted());
      dispatch(fetch(api.fecthHistorialReserva, { numSiniestro }))
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchHistorialReservaFinished(resp.data));
            resolve(resp);
          } else {
            dispatch(fetchHistorialReservaFinished([]));
            reject(resp.message);
          }
        })
        .catch(error => {
          dispatch(fetchHistorialReservaFinished([]));
        });
    });
}
