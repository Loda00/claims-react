import * as api from 'services/types/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';

export const FETCH_MOTIVO_STARTED = 'FETCH_MOTIVO_STARTED';
export const FETCH_MOTIVO_FINISHED = 'FETCH_MOTIVO_FINISHED';

export const fetcMotivoStarted = () => {
  return {
    type: FETCH_MOTIVO_STARTED
  };
};

export const fetchMotivoFinished = motivos => {
  return {
    type: FETCH_MOTIVO_FINISHED,
    payload: {
      motivos
    }
  };
};

export const fetchMotivo = () => {
  return dispatch =>
    new Promise((res, rej) => {
      dispatch(fetcMotivoStarted());
      dispatch(
        fetch(api.fetchTypes, {
          ruta: 'CRG_TFLUJO_SIN'
        })
      )
        .then(resp => {
          switch (resp.code) {
            case 'CRG-000':
              dispatch(fetchMotivoFinished(resp.data));
              res(resp);
              break;
            default:
              dispatch(fetchMotivoFinished([]));
              rej(resp.message);
          }
        })
        .catch(() => {
          dispatch(fetchMotivoFinished([]));
          rej(CONSTANTS_APP.GENERIC_ERROR_MESSAGE);
        });
    });
};
