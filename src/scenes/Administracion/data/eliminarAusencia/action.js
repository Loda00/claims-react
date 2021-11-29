import fetchEliminaAusencia from 'scenes/Administracion/data/eliminarAusencia/api';
import { fetch } from 'services/api/actions';

export const FETCH_ELIMINAR_AUSENCIA_STARTED = 'Administracion/data/eliminarAusencia/FETCH_ELIMINAR_AUSENCIA_STARTED';
export const FETCH_ELIMINAR_AUSENCIA_FINISHED = 'Administracion/data/eliminarAusencia/FETCH_ELIMINAR_AUSENCIA_FINISHED';
export const FETCH_ELIMINAR_AUSENCIA_RESET = 'Administracion/data/eliminarAusencia/FETCH_ELIMINAR_AUSENCIA_RESET';

export function fetchEliminarAusenciaStarted() {
  return {
    type: FETCH_ELIMINAR_AUSENCIA_STARTED
  };
}

export function fetchEliminarAusenciaFinished() {
  return {
    type: FETCH_ELIMINAR_AUSENCIA_FINISHED
  };
}

export function fetchEliminarAusenciaReset() {
  return {
    type: FETCH_ELIMINAR_AUSENCIA_RESET
  };
}

export const fetchEliminarAusencia = crgPersonaAusencia => dispatch =>
  new Promise(function async(resolve, reject) {
    const data = {
      operacion: 'EA',
      crgPersonaAusencia
    };
    dispatch(fetchEliminarAusenciaStarted());
    dispatch(fetch(fetchEliminaAusencia, data))
      .then(resp => {
        if (resp.code === 'CRG-000') {
          dispatch(fetchEliminarAusenciaFinished());
          resolve(resp);
        } else {
          dispatch(fetchEliminarAusenciaFinished());
          reject(resp.message);
        }
      })
      .catch(error => {
        dispatch(fetchEliminarAusenciaFinished());
        reject(error);
      });
  });
