/* eslint-disable func-names */

import * as api from 'scenes/Administracion/data/listarAjustador/api';
import { fetch } from 'services/api/actions';

export const FETCH_LIST_AJUSTADORES_STARTED = 'Administracion/data/listarAjustador/FETCH_LIST_AJUSTADORES_STARTED';
export const FETCH_LIST_AJUSTADORES_FINISHED = 'Administracion/data/listarAjustador/FETCH_LIST_AJUSTADORES_FINISHED';
export const FETCH_LIST_AJUSTADORES_RESET = 'Administracion/data/listarAjustador/FETCH_LIST_AJUSTADORES_RESET';

export function fetchListAjustadorStarted() {
  return {
    type: FETCH_LIST_AJUSTADORES_STARTED
  };
}

export function fetchListAjustadorFinished(listarAjustador) {
  return {
    type: FETCH_LIST_AJUSTADORES_FINISHED,
    payload: {
      listarAjustador
    }
  };
}

export function fetchListAjustadorReset() {
  return {
    type: FETCH_LIST_AJUSTADORES_RESET
  };
}

export function fetchListAjustador(values) {
  return dispatch =>
    new Promise(function(resolve, reject) {
      const { codAjustador, descAjustador } = values || {};
      const data = {
        codAjustador: codAjustador ? codAjustador.trim() : null,
        ajustador: descAjustador ? descAjustador.trim() : null
      };

      dispatch(fetchListAjustadorStarted());
      dispatch(fetch(api.fetchListAjustador, data))
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchListAjustadorFinished(resp.data));
            resolve(resp);
          } else {
            dispatch(fetchListAjustadorFinished([]));
            reject(resp.message);
          }
        })
        .catch(() => {
          dispatch(fetchListAjustadorFinished([]));
        });
    });
}
