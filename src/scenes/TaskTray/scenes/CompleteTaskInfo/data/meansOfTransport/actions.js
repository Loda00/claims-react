import * as api from 'services/types/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';

export const FETCH_MEANS_OF_TRANSPORT_STARTED =
  'TaskTray/scenes/CompleteTaskInfo/data/meansOfTransport/FETCH_MEANS_OF_TRANSPORT_STARTED';
export const FETCH_MEANS_OF_TRANSPORT_SUCCEEDED =
  'TaskTray/scenes/CompleteTaskInfo/data/meansOfTransport/FETCH_MEANS_OF_TRANSPORT_SUCCEEDED';
export const FETCH_MEANS_OF_TRANSPORT_FAILED =
  'TaskTray/scenes/CompleteTaskInfo/data/meansOfTransport/FETCH_MEANS_OF_TRANSPORT_FAILED';
export const FETCH_MEANS_OF_TRANSPORT_RESET =
  'TaskTray/scenes/CompleteTaskInfo/data/meansOfTransport/FETCH_MEANS_OF_TRANSPORT_RESET';

export function fetchMeansOfTransportReset() {
  return {
    type: FETCH_MEANS_OF_TRANSPORT_RESET
  };
}

export function fetchMeansOfTransportStarted() {
  return {
    type: FETCH_MEANS_OF_TRANSPORT_STARTED
  };
}

export function fetchMeansOfTransportSucceeded(meansOfTransport) {
  return {
    type: FETCH_MEANS_OF_TRANSPORT_SUCCEEDED,
    payload: {
      meansOfTransport
    }
  };
}

export function fetchMeansOfTransportFailed(error) {
  return {
    type: FETCH_MEANS_OF_TRANSPORT_FAILED,
    payload: error
  };
}

export const fetchMeansOfTransport = ruta => dispatch =>
  new Promise(function(resolve, reject) {
    dispatch(fetchMeansOfTransportStarted());
    dispatch(fetch(api.fetchTypes, { ruta }))
      .then(resp => {
        switch (resp.code) {
          case 'CRG-000':
            dispatch(fetchMeansOfTransportSucceeded(resp.data));
            resolve(resp);
            break;
          default:
            dispatch(fetchMeansOfTransportFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
            reject(resp.message);
        }
      })
      .catch(error => {
        dispatch(fetchMeansOfTransportFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
        reject(error);
      });
  });
