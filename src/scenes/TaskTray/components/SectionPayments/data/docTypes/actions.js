import * as api from 'services/types/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';

import { getDocTypes } from 'scenes/TaskTray/components/SectionPayments/data/docTypes/reducer';

export const FETCH_DOC_TYPES_STARTED =
  'scenes/TaskTray/components/SectionPayments/data/docTypes/FETCH_DOC_TYPES_STARTED';
export const FETCH_DOC_TYPES_SUCCEEDED =
  'scenes/TaskTray/components/SectionPayments/data/docTypes/FETCH_DOC_TYPES_SUCCEEDED';
export const FETCH_DOC_TYPES_RESET = 'scenes/TaskTray/components/SectionPayments/data/docTypes/FETCH_DOC_TYPES_RESET';
export const FETCH_DOC_TYPES_FAILED = 'scenes/TaskTray/components/SectionPayments/data/docTypes/FETCH_DOC_TYPES_FAILED';

export function fetchDocTypesStarted() {
  return {
    type: FETCH_DOC_TYPES_STARTED
  };
}

export function fetchDocTypesSucceeded(docTypes) {
  return {
    type: FETCH_DOC_TYPES_SUCCEEDED,
    payload: {
      docTypes
    }
  };
}

export function fetchDocTypesFailed(error) {
  return {
    type: FETCH_DOC_TYPES_FAILED,
    payload: error
  };
}

export function fetchDocTypesReset() {
  return {
    type: FETCH_DOC_TYPES_RESET
  };
}

export function fetchDocTypes(ruta) {
  return (dispatch, getState) =>
    new Promise((resolve, reject) => {
      // if there is data not call API
      if (getDocTypes(getState()).docTypes.length > 0) return resolve();

      dispatch(fetchDocTypesStarted());
      dispatch(fetch(api.fetchTypes, { ruta }))
        .then(resp => {
          switch (resp.code) {
            case 'CRG-000':
              dispatch(fetchDocTypesSucceeded(resp.data));
              resolve(resp);
              break;
            default:
              dispatch(fetchDocTypesFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
              reject(resp.message);
          }
        })
        .catch(error => {
          dispatch(fetchDocTypesFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
          reject(error);
        });
    });
}
