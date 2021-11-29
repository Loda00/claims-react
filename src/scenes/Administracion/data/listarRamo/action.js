/* eslint-disable func-names */

import * as api from 'scenes/Administracion/data/listarRamo/api';
import { fetch } from 'services/api/actions';

export const FETCH_LIST_RAMOS_STARTED = 'Administracion/data/listarRamo/FETCH_LIST_RAMOS_STARTED';
export const FETCH_LIST_RAMOS_FINISHED = 'Administracion/data/listarRamo/FETCH_LIST_RAMOS_FINISHED';
export const FETCH_LIST_RAMOS_RESET = 'Administracion/data/listarRamo/FETCH_LIST_RAMOS_RESET';

export function fetchListRamosStarted() {
  return {
    type: FETCH_LIST_RAMOS_STARTED
  };
}

export function fetchListRamosFinished(listarRamo) {
  return {
    type: FETCH_LIST_RAMOS_FINISHED,
    payload: {
      listarRamo
    }
  };
}

export function fetchListRamosReset() {
  return {
    type: FETCH_LIST_RAMOS_RESET
  };
}

export function fetchListRamos(codigoRamo, descripcionRamo) {
  return (dispatch, getState) =>
    new Promise(function(resolve, reject) {
      const codRamo = codigoRamo || null;
      const dscRamo = descripcionRamo || null;
      dispatch(fetchListRamosStarted());
      dispatch(fetch(api.fetchListRamos, { codRamo, dscRamo }))
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchListRamosFinished(resp.data));
            resolve(resp);
          } else {
            dispatch(fetchListRamosFinished([]));
            reject(resp.message);
          }
        })
        .catch(error => {
          dispatch(fetchListRamosFinished([]));
        });
    });
}
