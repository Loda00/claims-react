import fetchBuscarParametros from 'scenes/Administracion/data/bscParametros/api';
import { fetch } from 'services/api/actions';

export const FETCH_BSC_PARAM_STARTED = 'Administracion/data/bscParametros/FETCH_BSC_PARAM_STARTED';
export const FETCH_BSC_PARAM_FINISHED = 'Administracion/data/bscParametros/FETCH_BSC_PARAM_FINISHED';
export const FETCH_BSC_PARAM_RESET = 'Administracion/data/bscParametros/FETCH_BSC_PARAM_RESET';

export function fetchBusquedaParametrosStarted() {
  return {
    type: FETCH_BSC_PARAM_STARTED
  };
}

export function fetchBusquedaParametrosFinished(bscParametros) {
  return {
    type: FETCH_BSC_PARAM_FINISHED,
    payload: {
      bscParametros
    }
  };
}

export function fetchBusquedaParametrosReset() {
  return {
    type: FETCH_BSC_PARAM_RESET
  };
}

export function fetchBusquedaParametros(values) {
  return dispatch =>
    new Promise((resolve, reject) => {
      const data = {
        nomParametro: values
      };
      dispatch(fetchBusquedaParametrosStarted());
      dispatch(fetch(fetchBuscarParametros, data))
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchBusquedaParametrosFinished(resp.data));
            resolve(resp);
          } else {
            dispatch(fetchBusquedaParametrosFinished([]));
            reject(resp.message);
          }
        })
        .catch(() => {
          dispatch(fetchBusquedaParametrosFinished([]));
        });
    });
}
