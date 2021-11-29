import fetchEliminaReemplazo from 'scenes/Administracion/data/eliminarReemplazo/api';
import { fetch } from 'services/api/actions';

export const FETCH_ELIMINAR_REEMPLAZO_STARTED =
  'Administracion/data/eliminarReemplazo/FETCH_ELIMINAR_REEMPLAZO_STARTED';
export const FETCH_ELIMINAR_REEMPLAZO_FINISHED =
  'Administracion/data/eliminarReemplazo/FETCH_ELIMINAR_REEMPLAZO_FINISHED';
export const FETCH_ELIMINAR_REEMPLAZO_RESET = 'Administracion/data/eliminarReemplazo/FETCH_ELIMINAR_REEMPLAZO_RESET';

export function fetchEliminarReemplazoStarted() {
  return {
    type: FETCH_ELIMINAR_REEMPLAZO_STARTED
  };
}

export function fetchEliminarReemplazoFinished() {
  return {
    type: FETCH_ELIMINAR_REEMPLAZO_FINISHED
  };
}

export function fetchEliminarReemplazoReset() {
  return {
    type: FETCH_ELIMINAR_REEMPLAZO_RESET
  };
}

export const fetchEliminarReemplazo = crgPersona => dispatch =>
  new Promise(function async(resolve, reject) {
    const data = {
      operacion: 'ER',
      crgPersona
    };
    dispatch(fetchEliminarReemplazoStarted());
    dispatch(fetch(fetchEliminaReemplazo, data))
      .then(resp => {
        if (resp.code === 'CRG-000') {
          dispatch(fetchEliminarReemplazoFinished());
          resolve(resp);
        } else {
          dispatch(fetchEliminarReemplazoFinished());
          reject(resp.message);
        }
      })
      .catch(error => {
        dispatch(fetchEliminarReemplazoFinished());
        reject(error);
      });
  });
