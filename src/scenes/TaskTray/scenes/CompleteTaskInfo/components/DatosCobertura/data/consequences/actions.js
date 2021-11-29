import * as api from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DatosCobertura/data/consequences/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';

export const FETCH_CONSEQUENCES_STARTED =
  'CompleteTaskInfo/components/DatosCobertura/data/consequences/FETCH_CONSEQUENCES_STARTED';
export const FETCH_CONSEQUENCES_SUCCEEDED =
  'CompleteTaskInfo/components/DatosCobertura/data/consequences/FETCH_CONSEQUENCES_SUCCEEDED';
export const FETCH_CONSEQUENCES_RESET =
  'CompleteTaskInfo/components/DatosCobertura/data/consequences/FETCH_CONSEQUENCES_RESET';
export const FETCH_CONSEQUENCES_FAILED =
  'CompleteTaskInfo/components/DatosCobertura/data/consequences/FETCH_CONSEQUENCES_FAILED';

export function fetchConsequencesStarted() {
  return {
    type: FETCH_CONSEQUENCES_STARTED
  };
}

export function fetchConsequencesSucceeded(consequences) {
  return {
    type: FETCH_CONSEQUENCES_SUCCEEDED,
    payload: {
      consequences
    }
  };
}

export function fetchConsequencesFailed(error) {
  return {
    type: FETCH_CONSEQUENCES_FAILED,
    payload: error
  };
}

export function fetchConsequencesReset() {
  return {
    type: FETCH_CONSEQUENCES_RESET
  };
}

export function fetchConsequences(codRamo) {
  return dispatch =>
    new Promise((resolve, reject) => {
      dispatch(fetchConsequencesStarted());
      dispatch(
        fetch(api.fetchConsequences, {
          codRamo
        })
      )
        .then(resp => {
          switch (resp.code) {
            case 'CRG-000':
              dispatch(fetchConsequencesSucceeded(resp.data));
              resolve(resp);
              break;
            case 'CRG-204':
              dispatch(fetchConsequencesReset());
              break;
            default:
              dispatch(fetchConsequencesFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
              reject(resp);
          }
        })
        .catch(error => {
          dispatch(fetchConsequencesFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
          reject(error);
        });
    });
}
