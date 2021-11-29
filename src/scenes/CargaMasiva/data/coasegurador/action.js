import * as api from 'services/types/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';

export const FETCH_CM_COASEGURADOR_STARTED = 'FETCH_CM_COASEGURADOR_STARTED';
export const FETCH_CM_COASEGURADOR_FINISHED = 'FETCH_CM_COASEGURADOR_FINISHED';
export const FETCH_CM_COASEGURADOR_RESET = 'FETCH_CM_COASEGURADOR_RESET';

export const fetchCoaseguradorStarted = () => {
  return {
    type: FETCH_CM_COASEGURADOR_STARTED
  };
};

export const fetchCoaseguradorFinished = coasegurador => {
  return {
    type: FETCH_CM_COASEGURADOR_FINISHED,
    payload: {
      coasegurador
    }
  };
};

export const fetchCoaseguradorReset = () => {
  return {
    type: FETCH_CM_COASEGURADOR_RESET
  };
};

export const fetchCoasegurador = () => {
  return dispatch =>
    new Promise((res, rej) => {
      dispatch(fetchCoaseguradorStarted());
      dispatch(
        fetch(api.fetchTypes, {
          ruta: 'CRG_LVAL_COALIDER'
        })
      )
        .then(resp => {
          switch (resp.code) {
            case 'CRG-000':
              dispatch(fetchCoaseguradorFinished(resp.data));
              res(resp);
              break;
            default:
              dispatch(fetchCoaseguradorFinished([]));
              rej(resp.message);
          }
        })
        .catch(() => {
          dispatch(fetchCoaseguradorFinished([]));
          rej(CONSTANTS_APP.GENERIC_ERROR_MESSAGE);
        });
    });
};
