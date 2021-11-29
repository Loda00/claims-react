import * as api from 'scenes/TaskTray/components/SectionPayments/components/PagosFormItem/components/PaymentTabs/components/Coordenadas/data/coordenadas/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';

export const FETCH_COORDENADAS_STARTED =
  'scenes/TaskTray/components/SectionPayments/components/PagosFormItem/components/PaymentTabs/components/Coordenadas/data/coordenadas/FETCH_COORDENADAS_STARTED';
export const FETCH_COORDENADAS_FINISHED =
  'scenes/TaskTray/components/SectionPayments/components/PagosFormItem/components/PaymentTabs/components/Coordenadas/data/coordenadas/FETCH_COORDENADAS_FINISHED';
export const FETCH_COORDENADAS_RESET =
  'scenes/TaskTray/components/SectionPayments/components/PagosFormItem/components/PaymentTabs/components/Coordenadas/data/coordenadas/FETCH_COORDENADAS_RESET';
export const MAINTAIN_COORDENADA_STARTED =
  'scenes/TaskTray/components/SectionPayments/components/PagosFormItem/components/PaymentTabs/components/Coordenadas/data/coordenadas/MAINTAIN_COORDENADA_STARTED';
export const MAINTAIN_COORDENADA_FINISHED =
  'scenes/TaskTray/components/SectionPayments/components/PagosFormItem/components/PaymentTabs/components/Coordenadas/data/coordenadas/MAINTAIN_COORDENADA_FINISHED';

export const SEND_COORDENADA_CORE_STARTED =
  'scenes/TaskTray/components/SectionPayments/components/PagosFormItem/components/PaymentTabs/components/Coordenadas/data/coordenadas/SEND_COORDENADA_CORE_STARTED';
export const SEND_COORDENADA_CORE_FINISHED =
  'scenes/TaskTray/components/SectionPayments/components/PagosFormItem/components/PaymentTabs/components/Coordenadas/data/coordenadas/SEND_COORDENADA_CORE_FINISHED';

export function fetchCoordenadasStarted() {
  return {
    type: FETCH_COORDENADAS_STARTED
  };
}

export function fetchCoordenadasFinished(coordenadas) {
  return {
    type: FETCH_COORDENADAS_FINISHED,
    payload: {
      coordenadas
    }
  };
}

export function fetchCoordenadasReset() {
  return {
    type: FETCH_COORDENADAS_RESET
  };
}

export function maintainCoordenadaStarted() {
  return {
    type: MAINTAIN_COORDENADA_STARTED
  };
}

export function maintainCoordenadaFinished() {
  return {
    type: MAINTAIN_COORDENADA_FINISHED
  };
}

export function sendCoordenadaCoreStarted() {
  return {
    type: SEND_COORDENADA_CORE_STARTED
  };
}

export function sendCoordenadaCoreFinished(coordenadaCoreResponse) {
  return {
    type: SEND_COORDENADA_CORE_FINISHED,
    payload: {
      coordenadaCoreResponse
    }
  };
}

export function fetchCoordenadas(numCaso) {
  return dispatch =>
    new Promise((resolve, reject) => {
      dispatch(fetchCoordenadasStarted());
      dispatch(fetch(api.fetchCoordenadas, { numCaso }))
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchCoordenadasFinished(resp.data));
            resolve(resp);
          } else {
            dispatch(fetchCoordenadasFinished([]));
            reject(resp.message);
          }
        })
        .catch(error => {
          dispatch(fetchCoordenadasFinished([]));
          reject(CONSTANTS_APP.GENERIC_ERROR_MESSAGE);
        });
    });
}

export function maintainCoordenada(accion, data) {
  return dispatch =>
    new Promise((resolve, reject) => {
      dispatch(maintainCoordenadaStarted());
      dispatch(fetch(api.maintainCoordenada, { accion, data }))
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(maintainCoordenadaFinished());
            resolve(resp);
          } else {
            dispatch(maintainCoordenadaFinished());
            reject(resp.message);
          }
        })
        .catch(error => {
          dispatch(maintainCoordenadaFinished());
          reject(error);
        });
    });
}

export function sendCoordenadaCore(params) {
  return dispatch =>
    new Promise((resolve, reject) => {
      dispatch(sendCoordenadaCoreStarted());
      dispatch(fetch(api.sendCoordenadaCore, params))
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(sendCoordenadaCoreFinished(resp.data));
            resolve(resp);
          } else {
            dispatch(sendCoordenadaCoreFinished([]));
            reject(resp.message);
          }
        })
        .catch(() => {
          dispatch(sendCoordenadaCoreFinished([]));
          reject(CONSTANTS_APP.GENERIC_ERROR_MESSAGE);
        });
    });
}
