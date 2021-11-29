import * as api from 'scenes/Administracion/Ramo/data/mantenerRamo/api';
import { fetch } from 'services/api/actions';

export const FETCH_MNT_RAMO_STARTED = 'Administracion/Ramo/data/mantenerRamo/FETCH_MNT_RAMO_STARTED';
export const FETCH_MNT_RAMO_FINISHED = 'Administracion/Ramo/data/mantenerRamo/FETCH_MNT_RAMO_FINISHED';

export function fetchMantenimientoRamoStarted() {
  return {
    type: FETCH_MNT_RAMO_STARTED
  };
}

export function fetchMantenimientoRamoFinished() {
  return {
    type: FETCH_MNT_RAMO_FINISHED
  };
}

export function fetchMantenimientoRamo(accion, codMtrRamo, dscMtrRamo) {
  return (dispatch, getState) =>
    new Promise(function(resolve, reject) {
      dispatch(fetchMantenimientoRamoStarted());
      dispatch(fetch(api.fetchMantenimientoRamo, { accion, codMtrRamo, dscMtrRamo }))
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchMantenimientoRamoFinished());
            resolve(resp);
          } else {
            dispatch(fetchMantenimientoRamoFinished());
            resolve(resp.message);
          }
        })
        .catch(error => {
          dispatch(fetchMantenimientoRamoFinished());
        });
    });
}
