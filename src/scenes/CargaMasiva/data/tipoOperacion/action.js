import * as api from 'services/types/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';

export const FETCH_CM_TIPO_OPERACION_STARTED = 'FETCH_CM_TIPO_OPERACION_STARTED';
export const FETCH_CM_TIPO_OPERACION_FINISHED = 'FETCH_CM_TIPO_OPERACION_FINISHED';
export const FETCH_CM_TIPO_OPERACION_RESET = 'FETCH_CM_TIPO_OPERACION_RESET';

export const fetcTipoOperacionStarted = () => {
  return {
    type: FETCH_CM_TIPO_OPERACION_STARTED
  };
};

export const fetchTipoOperacionFinished = tipoOperacion => {
  return {
    type: FETCH_CM_TIPO_OPERACION_FINISHED,
    payload: {
      tipoOperacion
    }
  };
};

export const fetchTipoOperacionReset = () => {
  return {
    type: FETCH_CM_TIPO_OPERACION_RESET
  };
};

export const fetchTipoOperacion = () => {
  return dispatch =>
    new Promise((res, rej) => {
      dispatch(fetcTipoOperacionStarted());
      dispatch(
        fetch(api.fetchTypes, {
          ruta: 'CRG_CARGAMASIVA_TIPO_OPERACION'
        })
      )
        .then(resp => {
          switch (resp.code) {
            case 'CRG-000':
              dispatch(fetchTipoOperacionFinished(resp.data));
              res(resp);
              break;
            default:
              dispatch(fetchTipoOperacionFinished([]));
              rej(resp.message);
          }
        })
        .catch(() => {
          dispatch(fetchTipoOperacionFinished([]));
          rej(CONSTANTS_APP.GENERIC_ERROR_MESSAGE);
        });
    });
};
