import { fetchTypes } from 'services/types/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';

// import { getCoinTypes } from 'scenes/TaskTray/components/SectionPayments/data/coinTypes/reducer';

export const FETCH_MOTIVOS_RECHAZO_STARTED = 'FETCH_MOTIVOS_RECHAZO_STARTED';
export const FETCH_MOTIVOS_RECHAZO_SUCCEEDED = 'FETCH_MOTIVOS_RECHAZO_SUCCEEDED';
export const FETCH_MOTIVOS_RECHAZO_RESET = 'FETCH_MOTIVOS_RECHAZO_RESET';
export const FETCH_MOTIVOS_RECHAZO_FAILED = 'FETCH_MOTIVOS_RECHAZO_FAILED';

export function fetchMotivosRechazoStarted() {
  return {
    type: FETCH_MOTIVOS_RECHAZO_STARTED
  };
}

export function fetchMotivosRechazoSucceeded(motivosRechazo) {
  return {
    type: FETCH_MOTIVOS_RECHAZO_SUCCEEDED,
    payload: {
      motivosRechazo
    }
  };
}

export function fetchMotivosRechazoFailed(error) {
  return {
    type: FETCH_MOTIVOS_RECHAZO_FAILED,
    payload: error
  };
}

export function fetchMotivosRechazoReset() {
  return {
    type: FETCH_MOTIVOS_RECHAZO_RESET
  };
}

export function fetchMotivosRechazo(ruta) {
  return dispatch =>
    new Promise((resolve, reject) => {
      // if (getCoinTypes(getState()).coinTypes.length > 0) return resolve();

      dispatch(fetchMotivosRechazoStarted());
      dispatch(fetch(fetchTypes, { ruta }))
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchMotivosRechazoSucceeded(resp.data));
            resolve(resp);
          } else {
            dispatch(fetchMotivosRechazoFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
            reject(resp.message);
          }
        })
        .catch(error => {
          dispatch(fetchMotivosRechazoFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
          reject(error);
        });
    });
}
