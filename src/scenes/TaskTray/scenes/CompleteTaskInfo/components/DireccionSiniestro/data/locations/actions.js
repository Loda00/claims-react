import * as api from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DireccionSiniestro/data/locations/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';
import { getParam } from 'services/types/reducer';

export const FETCH_LOCATIONS_STARTED =
  'CompleteTaskInfo/components/DireccionSiniestro/data/locations/FETCH_LOCATIONS_STARTED';
export const FETCH_LOCATIONS_SUCCEEDED =
  'CompleteTaskInfo/components/DireccionSiniestro/data/locations/FETCH_LOCATIONS_SUCCEEDED';
export const FETCH_LOCATIONS_RESET =
  'CompleteTaskInfo/components/DireccionSiniestro/data/locations/FETCH_LOCATIONS_RESET';
export const FETCH_LOCATIONS_FAILED =
  'CompleteTaskInfo/components/DireccionSiniestro/data/locations/FETCH_LOCATIONS_FAILED';

export function fetchLocationsStarted() {
  return {
    type: FETCH_LOCATIONS_STARTED
  };
}

export function fetchLocationsSucceeded(locations) {
  return {
    type: FETCH_LOCATIONS_SUCCEEDED,
    payload: {
      locations
    }
  };
}

export function fetchLocationsFailed(error) {
  return {
    type: FETCH_LOCATIONS_FAILED,
    payload: error
  };
}

export function fetchLocationsReset() {
  return {
    type: FETCH_LOCATIONS_RESET
  };
}

export function fetchLocations(texto) {
  const thunk = (dispatch, getState) =>
    new Promise((resolve, reject) => {
      dispatch(fetchLocationsStarted());

      const data = {
        texto,
        codPais: getParam(getState(), 'CRG_SYN_TAREAS', 'CODPAIS')
      };

      dispatch(fetch(api.fetchAddresses, data))
        .then(resp => {
          switch (resp.code) {
            case 'CRG-000':
              dispatch(fetchLocationsSucceeded(resp.data));
              resolve(resp);
              break;
            case 'CRG-204':
              dispatch(fetchLocationsReset());
              break;
            default:
              dispatch(fetchLocationsFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
              reject(resp);
          }
        })
        .catch(error => {
          dispatch(fetchLocationsFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
          reject(error);
        });
    });

  thunk.meta = {
    debounce: {
      time: 400,
      key: 'FETCH_LOCATIONS'
    }
  };

  return thunk;
}
