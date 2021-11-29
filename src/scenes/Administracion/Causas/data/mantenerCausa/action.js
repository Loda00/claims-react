import * as api from 'scenes/Administracion/Causas/data/mantenerCausa/api';
import { fetch } from 'services/api/actions';

export const FETCH_MNT_CAUSA_STARTED = 'Administracion/Causas/data/mantenerCausa/FETCH_MNT_CAUSA_STARTED';
export const FETCH_MNT_CAUSA_FINISHED = 'Administracion/Causas/data/mantenerCausa/FETCH_MNT_CAUSA_FINISHED';

export function fetchMantenimientoCausaStarted() {
  return {
    type: FETCH_MNT_CAUSA_STARTED
  };
}

export function fetchMantenimientoCausaFinished() {
  return {
    type: FETCH_MNT_CAUSA_FINISHED
  };
}

export function fetchMantenimientoCausa(accion, idMtrCausa, codMtrCausa, dscMtrCausa, codMtrRamo) {
  return (dispatch, getState) =>
    new Promise(function(resolve, reject) {
      dispatch(fetchMantenimientoCausaStarted());
      dispatch(fetch(api.fetchMantenimientoCausa, { accion, idMtrCausa, codMtrCausa, dscMtrCausa, codMtrRamo }))
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchMantenimientoCausaFinished());
            resolve(resp);
          } else {
            dispatch(fetchMantenimientoCausaFinished());
            resolve(resp.message);
          }
        })
        .catch(error => {
          dispatch(fetchMantenimientoCausaFinished());
        });
    });
}
