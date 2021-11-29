import { fetchTypes } from 'services/types/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';

// import { getCoinTypes } from 'scenes/TaskTray/components/SectionPayments/data/coinTypes/reducer';

export const FETCH_MOTIVOS_RECHAZO_SBS_STARTED = 'FETCH_MOTIVOS_RECHAZO_SBS_STARTED';
export const FETCH_MOTIVOS_RECHAZO_SBS_SUCCEEDED = 'FETCH_MOTIVOS_RECHAZO_SBS_SUCCEEDED';
export const FETCH_MOTIVOS_RECHAZO_SBS_RESET = 'FETCH_MOTIVOS_RECHAZO_SBS_RESET';
export const FETCH_MOTIVOS_RECHAZO_SBS_FAILED = 'FETCH_MOTIVOS_RECHAZO_SBS_FAILED';

export function fetchMotivosRechazoSbsStarted() {
  return {
    type: FETCH_MOTIVOS_RECHAZO_SBS_STARTED
  };
}

export function fetchMotivosRechazoSbsSucceeded(motivosRechazoSbs) {
  return {
    type: FETCH_MOTIVOS_RECHAZO_SBS_SUCCEEDED,
    payload: {
      motivosRechazoSbs
    }
  };
}

export function fetchMotivosRechazoSbsFailed(error) {
  return {
    type: FETCH_MOTIVOS_RECHAZO_SBS_FAILED,
    payload: error
  };
}

export function fetchMotivosRechazoSbsReset() {
  return {
    type: FETCH_MOTIVOS_RECHAZO_SBS_RESET
  };
}

export function fetchMotivosRechazoSbs(ruta) {
  return dispatch =>
    new Promise((resolve, reject) => {
      dispatch(fetchMotivosRechazoSbsStarted());
      dispatch(fetch(fetchTypes, { ruta }))
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchMotivosRechazoSbsSucceeded(resp.data));
            resolve(resp);
          } else {
            dispatch(fetchMotivosRechazoSbsFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
            reject(resp.message);
          }
        })
        .catch(error => {
          dispatch(fetchMotivosRechazoSbsFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
          reject(error);
        });
    });
}
