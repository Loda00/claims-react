import { obtenerMotivoAnular } from 'scenes/components/Anular/data/motivoAnular/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';

export const FETCH_MOTIVO_ANULAR_STARTED = 'FETCH_MOTIVO_ANULAR_STARTED';
export const FETCH_MOTIVO_ANULAR_FINISHED = 'FETCH_MOTIVO_ANULAR_FINISHED';

export const fetcMotivoStarted = () => {
  return {
    type: FETCH_MOTIVO_ANULAR_STARTED
  };
};

export const fetchMotivoFinished = motivos => {
  return {
    type: FETCH_MOTIVO_ANULAR_FINISHED,
    payload: {
      motivos
    }
  };
};

export const fetchMotivoAnular = () => {
  return dispatch =>
    new Promise((res, rej) => {
      dispatch(fetcMotivoStarted());
      dispatch(
        fetch(obtenerMotivoAnular, {
          ruta: 'CRG_LVAL_MOANUS'
        })
      )
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchMotivoFinished(resp.data));
            res(resp);
          } else {
            dispatch(fetchMotivoFinished([]));
            rej(CONSTANTS_APP.GENERIC_ERROR_MESSAGE);
          }
        })
        .catch(() => {
          dispatch(fetchMotivoFinished([]));
          rej(CONSTANTS_APP.GENERIC_ERROR_MESSAGE);
        });
    });
};
