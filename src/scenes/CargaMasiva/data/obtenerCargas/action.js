import * as api from 'services/types/api';
import { fetch } from 'services/api/actions';

export const FETCH_TIPO_CARGAS_INICIO = 'services/types/FETCH_TIPO_CARGAS_INICIO';
export const FETCH_TIPO_CARGA_TERMINADO = 'services/types/sinister/FETCH_TIPO_CARGA_TERMINADO';

export function fetchTipoCargaInicio() {
  return {
    type: FETCH_TIPO_CARGAS_INICIO
  };
}

export function fetchTipoCargaTerminado(ruta, params) {
  return {
    type: FETCH_TIPO_CARGA_TERMINADO,
    payload: {
      ruta,
      params
    }
  };
}

export const fetchTipoCarga = () => dispatch =>
  new Promise((resolve, reject) => {
    dispatch(fetchTipoCargaInicio());
    dispatch(fetch(api.fetchTypes, { ruta: 'CRG_CARGAMASIVA_TIPO_CARGA' }))
      .then(resp => {
        if (resp.code === 'CRG-000') {
          dispatch(fetchTipoCargaTerminado('CRG_CARGAMASIVA_TIPO_CARGA', resp.data));
          resolve(resp);
        }
      })
      .catch(error => {
        reject(error);
      });
  });
