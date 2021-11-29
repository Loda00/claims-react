import * as api from 'services/types/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';

export const FETCH_CM_TIPO_CARGA_STARTED = 'FETCH_CM_TIPO_CARGA_STARTED';
export const FETCH_CM_TIPO_CARGA_FINISHED = 'FETCH_CM_TIPO_CARGA_FINISHED';
export const FETCH_CM_TIPO_CARGA_RESET = 'FETCH_CM_TIPO_CARGA_RESET';

export const fetchTipoCargaStarted = () => {
  return {
    type: FETCH_CM_TIPO_CARGA_STARTED
  };
};

export const fetchTipoCargaFinished = tipoCarga => {
  return {
    type: FETCH_CM_TIPO_CARGA_FINISHED,
    payload: {
      tipoCarga
    }
  };
};

export const fetchTipoCargaReset = () => {
  return {
    type: FETCH_CM_TIPO_CARGA_RESET
  };
};

export const fetchTipoCarga = () => {
  return dispatch =>
    new Promise((res, rej) => {
      dispatch(fetchTipoCargaStarted());
      dispatch(
        fetch(api.fetchTypes, {
          ruta: 'CRG_CARGAMASIVA_TIPO_CARGA'
        })
      )
        .then(resp => {
          switch (resp.code) {
            case 'CRG-000':
              dispatch(fetchTipoCargaFinished(resp.data));
              res(resp);
              break;
            default:
              dispatch(fetchTipoCargaFinished([]));
              rej(resp.message);
          }
        })
        .catch(() => {
          dispatch(fetchTipoCargaFinished([]));
          rej(CONSTANTS_APP.GENERIC_ERROR_MESSAGE);
        });
    });
};
