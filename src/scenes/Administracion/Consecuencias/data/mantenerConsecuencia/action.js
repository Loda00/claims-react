import * as api from 'scenes/Administracion/Consecuencias/data/mantenerConsecuencia/api';
import { fetch } from 'services/api/actions';

export const FETCH_MNT_CONSECUENCIA_STARTED = 'Administracion/Causas/data/mantenerCausa/FETCH_MNT_CONSECUENCIA_STARTED';
export const FETCH_MNT_CONSECUENCIA_FINISHED =
  'Administracion/Causas/data/mantenerCausa/FETCH_MNT_CONSECUENCIA_FINISHED';

export function fetchMantenimientoConsecuenciaStarted() {
  return {
    type: FETCH_MNT_CONSECUENCIA_STARTED
  };
}

export function fetchMantenimientoConsecuenciaFinished() {
  return {
    type: FETCH_MNT_CONSECUENCIA_FINISHED
  };
}

export function fetchMantenimientoConsecuencia(
  accion,
  idMtrConsecuencia,
  codMtrConsecuencia,
  dscMtrConsecuencia,
  codMtrRamo
) {
  return (dispatch, getState) =>
    new Promise(function(resolve, reject) {
      dispatch(fetchMantenimientoConsecuenciaStarted());
      dispatch(
        fetch(api.fetchMantenimientoConsecuencia, {
          accion,
          idMtrConsecuencia,
          codMtrConsecuencia,
          dscMtrConsecuencia,
          codMtrRamo
        })
      )
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchMantenimientoConsecuenciaFinished());
            resolve(resp);
          } else {
            dispatch(fetchMantenimientoConsecuenciaFinished());
            resolve(resp.message);
          }
        })
        .catch(error => {
          dispatch(fetchMantenimientoConsecuenciaFinished());
        });
    });
}
