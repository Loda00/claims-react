import * as api from 'scenes/components/SectionCargarDocumento/data/subTypeDocument/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';

export const FETCH_SUB_TYPE_DOCUMENT_STARTED =
  'scenes/components/SectionCargarDocumento/data/subTypeDocument/FETCH_SUB_TYPE_DOCUMENT_STARTED';
export const FETCH_SUB_TYPE_DOCUMENT_SUCCEEDED =
  'scenes/components/SectionCargarDocumento/data/subTypeDocument/FETCH_SUB_TYPE_DOCUMENT_SUCCEEDED';
export const FETCH_SUB_TYPE_DOCUMENT_FAILED =
  'scenes/components/SectionCargarDocumento/data/subTypeDocument/FETCH_SUB_TYPE_DOCUMENT_FAILED';
export const FETCH_SUB_TYPE_DOCUMENT_RESET =
  'scenes/components/SectionCargarDocumento/data/subTypeDocument/FETCH_SUB_TYPE_DOCUMENT_RESET';

export function fetchSubTypeDocumentStarted() {
  return {
    type: FETCH_SUB_TYPE_DOCUMENT_STARTED
  };
}

export function fetchSubTypeDocumentSucceeded(subTypeDocument) {
  return {
    type: FETCH_SUB_TYPE_DOCUMENT_SUCCEEDED,
    payload: {
      subTypeDocument
    }
  };
}

export function fetchSubTypeDocumentFailed(error) {
  return {
    type: FETCH_SUB_TYPE_DOCUMENT_FAILED,
    payload: error
  };
}

export function fetchSubTypeDocumentReset() {
  return {
    type: FETCH_SUB_TYPE_DOCUMENT_RESET
  };
}

export const fetchSubTypeDocument = tipoDocumento => dispatch =>
  new Promise(function(resolve, reject) {
    dispatch(fetchSubTypeDocumentStarted());
    dispatch(fetch(api.fetchSubTypeDocument, { tipoDocumento }))
      .then(resp => {
        if (resp.code === 'CRG-000') {
          dispatch(fetchSubTypeDocumentSucceeded(resp.data));
          resolve(resp);
        } else {
          dispatch(fetchSubTypeDocumentFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
          reject(resp);
        }
      })
      .catch(error => {
        dispatch(fetchSubTypeDocumentFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
        reject(error);
      });
  });
