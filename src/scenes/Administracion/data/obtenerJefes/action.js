import fetchObtieneJefe from 'scenes/Administracion/data/obtenerJefes/api';
import { fetch } from 'services/api/actions';

export const FETCH_OBT_JEFE_STARTED = 'Administracion/data/obtenerJefes/FETCH_OBT_JEFE_STARTED';
export const FETCH_OBT_JEFE_FINISHED = 'Administracion/data/obtenerJefes/FETCH_OBT_JEFE_FINISHED';
export const FETCH_OBT_JEFE_RESET = 'Administracion/data/obtenerJefes/FETCH_OBT_JEFE_RESET';

export function fetchObtenerJefeStarted() {
  return {
    type: FETCH_OBT_JEFE_STARTED
  };
}

export function fetchObtenerJefeFinished(obtenerJefe) {
  return {
    type: FETCH_OBT_JEFE_FINISHED,
    payload: {
      obtenerJefe
    }
  };
}

export function fetchObtenerJefeReset() {
  return {
    type: FETCH_OBT_JEFE_RESET
  };
}

export function fetchObtenerJefe(crgcargo, crgequipo) {
  return dispatch =>
    new Promise((resolve, reject) => {
      const data = {
        crgcargo,
        crgequipo,
        operacion: 'OJ'
      };
      dispatch(fetchObtenerJefeStarted());
      dispatch(fetch(fetchObtieneJefe, data))
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchObtenerJefeFinished(resp.data));
            resolve(resp);
          } else {
            dispatch(fetchObtenerJefeFinished([]));
            reject(resp.message);
          }
        })
        .catch(() => {
          dispatch(fetchObtenerJefeFinished([]));
        });
    });
}
