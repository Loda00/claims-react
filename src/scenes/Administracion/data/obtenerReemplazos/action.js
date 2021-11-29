import fetchObtieneReemplazo from 'scenes/Administracion/data/obtenerReemplazos/api';
import { fetch } from 'services/api/actions';

export const FETCH_OBT_REEMPLAZO_STARTED = 'Administracion/data/obtenerReemplazos/FETCH_OBT_REEMPLAZO_STARTED';
export const FETCH_OBT_REEMPLAZO_FINISHED = 'Administracion/data/obtenerReemplazos/FETCH_OBT_REEMPLAZO_FINISHED';
export const FETCH_OBT_REEMPLAZO_RESET = 'Administracion/data/obtenerReemplazos/FETCH_OBT_REEMPLAZO_RESET';

export function fetchObtenerReemplazoStarted() {
  return {
    type: FETCH_OBT_REEMPLAZO_STARTED
  };
}

export function fetchObtenerReemplazoFinished(obtenerReemplazos) {
  return {
    type: FETCH_OBT_REEMPLAZO_FINISHED,
    payload: {
      obtenerReemplazos
    }
  };
}

export function fetchObtenerReemplazoReset() {
  return {
    type: FETCH_OBT_REEMPLAZO_RESET
  };
}

export function fetchObtenerReemplazo(crgPerson) {
  const data = {
    crgPersona: crgPerson.crgPersona ? crgPerson.crgPersona : crgPerson.pkPersona,
    operacion: 'OR'
  };
  return dispatch =>
    new Promise((resolve, reject) => {
      dispatch(fetchObtenerReemplazoStarted());
      dispatch(fetch(fetchObtieneReemplazo, data))
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchObtenerReemplazoFinished(resp.data));
            resolve(resp);
          } else {
            dispatch(fetchObtenerReemplazoFinished([]));
            reject(resp.message);
          }
        })
        .catch(() => {
          dispatch(fetchObtenerReemplazoFinished([]));
        });
    });
}
