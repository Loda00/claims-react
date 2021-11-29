import * as api from 'scenes/Administracion/data/listarRamoAjustador/api';
import { fetch } from 'services/api/actions';

export const FETCH_LIST_RAMO_STARTED = 'Administracion/data/listarRamoAjustador/FETCH_LIST_RAMO_STARTED';
export const FETCH_LIST_RAMO_FINISHED = 'Administracion/data/listarRamoAjustador/FETCH_LIST_RAMO_FINISHED';
export const FETCH_LIST_RAMO_RESET = 'Administracion/data/listarRamoAjustador/FETCH_LIST_RAMO_RESET';

export function fetchListRamoStarted() {
  return {
    type: FETCH_LIST_RAMO_STARTED
  };
}

export function fetchListRamoFinished(listarRamo) {
  return {
    type: FETCH_LIST_RAMO_FINISHED,
    payload: {
      listarRamo
    }
  };
}

export function fetchListRamoReset() {
  return {
    type: FETCH_LIST_RAMO_RESET
  };
}

export function fetchListRamo(values) {
  return (dispatch, getState) =>
    new Promise(function(resolve, reject) {
      const { nombre, apelidoPaterno, apelidoMaterno, cargo, equipo, email } = values || {};
      const data = {
        nombre: nombre || null,
        apePaterno: apelidoPaterno || null,
        apeMaterno: apelidoMaterno || null,
        crgCargo: cargo ? parseInt(cargo) : null,
        crgEquipo: equipo ? parseInt(equipo) : null,
        email: email || null
      };

      dispatch(fetchListRamoStarted());
      dispatch(fetch(api.fetchListRamo, data))
        .then(resp => {
          switch (resp.code) {
            case 'CRG-000':
              dispatch(fetchListRamoFinished(resp.data));

              resolve(resp);
              break;
            default:
              dispatch(fetchListRamoFinished([]));
              reject(resp.message);
          }
        })
        .catch(error => {
          dispatch(fetchListRamoFinished([]));
        });
    });
}
