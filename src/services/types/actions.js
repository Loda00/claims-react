import * as api from 'services/types/api';
import { fetch } from 'services/api/actions';

export const FETCH_PARAMS_STARTED = 'services/types/FETCH_PARAMS_STARTED';
export const FETCH_PARAMS_FINISHED = 'services/types/sinister/FETCH_PARAMS_FINISHED';

export function fetchParamsStarted() {
  return {
    type: FETCH_PARAMS_STARTED
  };
}

export function fetchParamsFinished(ruta, params) {
  return {
    type: FETCH_PARAMS_FINISHED,
    payload: {
      ruta,
      params
    }
  };
}

export const fetchParam = ruta => dispatch =>
  new Promise(function(resolve, reject) {
    dispatch(fetch(api.fetchTypes, { ruta }))
      .then(resp => {
        if (resp.code === 'CRG-000') {
          dispatch(fetchParamsFinished(ruta, resp.data));
          resolve(resp);
        } else {
          reject(new Error());
        }
      })
      .catch(error => {
        reject(new Error(`error desconocido al obtener el parametro con ruta: ${ruta}`));
      });
  });
