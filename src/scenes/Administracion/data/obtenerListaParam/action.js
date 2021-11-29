import fetchListParametros from 'scenes/Administracion/data/obtenerListaParam/api';
import { fetch } from 'services/api/actions';

export const FETCH_LIST_PARAM_STARTED = 'Administracion/data/obtenerListaParam/FETCH_LIST_PARAM_STARTED';
export const FETCH_LIST_PARAM_FINISHED = 'Administracion/data/obtenerListaParam/FETCH_LIST_PARAM_FINISHED';
export const FETCH_LIST_PARAM_RESET = 'Administracion/data/obtenerListaParam/FETCH_LIST_PARAM_RESET';

export function fetchListaParametrosStarted() {
  return {
    type: FETCH_LIST_PARAM_STARTED
  };
}

export function fetchListaParametrosFinished(listaParametros) {
  return {
    type: FETCH_LIST_PARAM_FINISHED,
    payload: {
      listaParametros
    }
  };
}

export function fetchListaParametrosReset() {
  return {
    type: FETCH_LIST_PARAM_RESET
  };
}

export function fetchListaParametros(values) {
  return dispatch =>
    new Promise((resolve, reject) => {
      const data = {
        ruta: values
      };

      dispatch(fetchListaParametrosStarted());
      dispatch(fetch(fetchListParametros, data))
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchListaParametrosFinished(resp.data));
            resolve(resp);
          } else {
            dispatch(fetchListaParametrosFinished([]));
            reject(resp.message);
          }
        })
        .catch(() => {
          dispatch(fetchListaParametrosFinished([]));
        });
    });
}
