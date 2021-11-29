import fetchObtieneAusencia from 'scenes/Administracion/data/obtenerAusencia/api';
import { fetch } from 'services/api/actions';

export const FETCH_OBT_AUSENCIA_STARTED = 'Administracion/data/obtenerAusencia/FETCH_OBT_AUSENCIA_STARTED';
export const FETCH_OBT_AUSENCIA_FINISHED = 'Administracion/data/obtenerAusencia/FETCH_OBT_AUSENCIA_FINISHED';
export const FETCH_OBT_AUSENCIA_RESET = 'Administracion/data/obtenerAusencia/FETCH_OBT_AUSENCIA_RESET';

export function fetchObtenerAusenciaStarted() {
  return {
    type: FETCH_OBT_AUSENCIA_STARTED
  };
}

export function fetchObtenerAusenciaFinished(obtenerAusencia) {
  return {
    type: FETCH_OBT_AUSENCIA_FINISHED,
    payload: {
      obtenerAusencia
    }
  };
}

export function fetchObtenerAusenciaReset() {
  return {
    type: FETCH_OBT_AUSENCIA_RESET
  };
}

export function fetchObtenerAusencia(crgPersonaAusencia) {
  return dispatch =>
    new Promise((resolve, reject) => {
      dispatch(fetchObtenerAusenciaStarted());
      dispatch(fetch(fetchObtieneAusencia, { crgPersonaAusencia }))
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchObtenerAusenciaFinished(resp.data));
            resolve(resp);
          } else {
            dispatch(fetchObtenerAusenciaFinished([]));
            reject(resp.message);
          }
        })
        .catch(() => {
          dispatch(fetchObtenerAusenciaFinished([]));
        });
    });
}
