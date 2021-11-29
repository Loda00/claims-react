import * as api from 'services/types/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';

export const FETCH_DOCUMENT_TYPES_SUCCEEDED = 'SearchInsured/data/documentTypes/FETCH_DOCUMENT_TYPES_SUCCEEDED';
export const FETCH_DOCUMENT_TYPES_STARTED = 'SearchInsured/data/documentTypes/FETCH_DOCUMENT_TYPES_STARTED';
export const FETCH_DOCUMENT_TYPES_FAILED = 'SearchInsured/data/documentTypes/FETCH_DOCUMENT_TYPES_FAILED';
export const FETCH_DOCUMENT_TYPES_RESET = 'SearchInsured/data/documentTypes/FETCH_DOCUMENT_TYPES_RESET';

export function fetchDocumentTypesStarted() {
  return {
    type: FETCH_DOCUMENT_TYPES_STARTED
  };
}

export function fetchDocumentTypesSucceeded(documentTypes) {
  return {
    type: FETCH_DOCUMENT_TYPES_SUCCEEDED,
    payload: {
      documentTypes
    }
  };
}

export function fetchDocumentTypesFailed(error) {
  return {
    type: FETCH_DOCUMENT_TYPES_FAILED,
    payload: error
  };
}

export function fetchDocumentTypesReset() {
  return {
    type: FETCH_DOCUMENT_TYPES_RESET
  };
}

export const fetchDocumentTypes = ruta => dispatch =>
  new Promise((resolve, reject) => {
    dispatch(fetchDocumentTypesStarted());
    dispatch(fetch(api.fetchTypes, { ruta }))
      .then(resp => {
        if (resp.code === 'CRG-000') {
          dispatch(fetchDocumentTypesSucceeded(resp.data));
          resolve(resp);
        } else {
          dispatch(fetchDocumentTypesFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
          reject(resp);
        }
      })
      .catch(error => {
        dispatch(fetchDocumentTypesFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
        reject(error);
      });
  });
