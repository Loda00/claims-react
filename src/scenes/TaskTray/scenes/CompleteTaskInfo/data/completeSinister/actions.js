import * as api from 'scenes/TaskTray/scenes/CompleteTaskInfo/data/completeSinister/api';
import { fetch } from 'services/api/actions';
import * as uiActionCreators from 'services/ui/actions';
import { CONSTANTS_APP } from 'constants/index';

export const COMPLETE_SINISTER_SUCCEEDED = 'CompleteTaskInfo/data/completeSinister/COMPLETE_SINISTER_SUCCEEDED';
export const COMPLETE_SINISTER_FAILED = 'CompleteTaskInfo/data/completeSinister/COMPLETE_SINISTER_FAILED';

export function completeSinisterFailed(error) {
  return {
    type: COMPLETE_SINISTER_FAILED,
    payload: error
  };
}

export function completeSinisterSucceeded(sinister) {
  return {
    type: COMPLETE_SINISTER_SUCCEEDED,
    payload: {
      sinister
    }
  };
}

export const completeSinister = siniestro => dispatch =>
  new Promise(function(resolve, reject) {
    dispatch(uiActionCreators.switchLoader());
    dispatch(fetch(api.completeSinister, siniestro))
      .then(resp => {
        switch (resp.code) {
          case 'CRG-000':
            dispatch(completeSinisterSucceeded());
            dispatch(uiActionCreators.switchLoader());
            resolve(resp);
            break;
          default:
            dispatch(completeSinisterFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
            dispatch(uiActionCreators.switchLoader());
            reject(resp);
        }
      })
      .catch(error => {
        dispatch(completeSinisterFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
        dispatch(uiActionCreators.switchLoader());
        reject(error);
      });
  });
