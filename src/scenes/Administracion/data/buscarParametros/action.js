import fetchBusquedaParametros from 'scenes/Administracion/data/buscarParametros/api';
import { fetch } from 'services/api/actions';

export const FETCH_BUSCAR_PARAMETROS_STARTED = 'Administracion/data/buscarParametros/FETCH_BUSCAR_PARAMETROS_STARTED';
export const FETCH_BUSCAR_PARAMETROS_FINISHED = 'Administracion/data/buscarParametros/FETCH_BUSCAR_PARAMETROS_FINISHED';
export const FETCH_BUSCAR_PARAMETROS_RESET = 'Administracion/data/buscarParametros/FETCH_BUSCAR_PARAMETROS_RESET';

export function fetchBuscarParametrosStarted() {
  return {
    type: FETCH_BUSCAR_PARAMETROS_STARTED
  };
}

export function fetchBuscarParametrosFinished(buscarParametros) {
  return {
    type: FETCH_BUSCAR_PARAMETROS_FINISHED,
    payload: {
      buscarParametros
    }
  };
}

export function fetchBuscarParametrosReset() {
  return {
    type: FETCH_BUSCAR_PARAMETROS_RESET
  };
}

export function fetchBuscarParametros(idRuta) {
  return dispatch =>
    new Promise((resolve, reject) => {
      dispatch(fetchBuscarParametrosStarted());
      dispatch(fetch(fetchBusquedaParametros, { idRuta }))
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchBuscarParametrosFinished(resp.data));
            resolve(resp);
          } else {
            dispatch(fetchBuscarParametrosFinished([]));
            reject(resp.message);
          }
        })
        .catch(() => {
          dispatch(fetchBuscarParametrosFinished([]));
        });
    });
}
