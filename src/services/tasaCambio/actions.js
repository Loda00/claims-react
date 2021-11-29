import moment from 'moment';
import * as api from 'services/tasaCambio/api';
import { fetch } from 'services/api/actions';

export const FETCH_TASACAMBIO_STARTED = 'services/tasaCambio/FETCH_TASACAMBIO_STARTED';
export const FETCH_TASACAMBIO_FINISHED = 'services/tasaCambio/FETCH_TASACAMBIO_FINISHED';

export function fetchTasaCambioStarted() {
  return {
    type: FETCH_TASACAMBIO_STARTED
  };
}

export function fetchTasaCambioFinished(codMonOrigen, codMonDes, tasaCambio) {
  return {
    type: FETCH_TASACAMBIO_FINISHED,
    payload: {
      key: `${codMonOrigen}-${codMonDes}`,
      tasaCambio
    }
  };
}

export function fetchTasaCambio(codMonOrigen, codMonDest, fecha = moment().format('DD/MM/YYYY'), tipoCalculo = 'D') {
  return dispatch =>
    new Promise(function(resolve, reject) {
      dispatch(fetchTasaCambioStarted());
      dispatch(fetch(api.fetchTasaCambio, { codMonOrigen, codMonDest, fecha, tipoCalculo }))
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchTasaCambioFinished(codMonOrigen, codMonDest, resp.data[0]));
            resolve(resp);
          } else {
            dispatch(fetchTasaCambioFinished([]));
            reject(resp.message);
          }
        })
        .catch(error => {
          dispatch(fetchTasaCambioFinished([]));
          reject(error);
        });
    });
}
