import { obtenerMotivo } from 'scenes/Query/Component/Reaperturar/data/motivoReaperturar/api';
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
        fetch(obtenerMotivo, {
          ruta: 'CRG_LVAL_MOTREANU'
        })
      )
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchMotivoFinished(resp.data));
            res(resp);
          } else {
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
