import * as api from 'scenes/components/SectionCargarDocumento/data/typeDocument/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';

export const FETCH_TYPE_DOCUMENT_STARTED =
  'scenes/components/SectionCargarDocumento/data/typeDocument/FETCH_TYPE_DOCUMENT_STARTED';
export const FETCH_TYPE_DOCUMENT_SUCCEEDED =
  'scenes/components/SectionCargarDocumento/data/typeDocument/FETCH_TYPE_DOCUMENT_SUCCEEDED';
export const FETCH_TYPE_DOCUMENT_FAILED =
  'scenes/components/SectionCargarDocumento/data/typeDocument/FETCH_TYPE_DOCUMENT_FAILED';
export const FETCH_TYPE_DOCUMENT_RESET =
  'scenes/components/SectionCargarDocumento/data/typeDocument/FETCH_TYPE_DOCUMENT_RESET';

export function fetchTypeDocumentStarted() {
  return {
    type: FETCH_TYPE_DOCUMENT_STARTED
  };
}

export function fetchTypeDocumentSucceeded(typeDocument) {
  return {
    type: FETCH_TYPE_DOCUMENT_SUCCEEDED,
    payload: {
      typeDocument
    }
  };
}

export function fetchTypeDocumentFailed(error) {
  return {
    type: FETCH_TYPE_DOCUMENT_FAILED,
    payload: error
  };
}

export function fetchTypeDocumentReset() {
  return {
    type: FETCH_TYPE_DOCUMENT_RESET
  };
}

export const fetchTypeDocument = () => dispatch =>
  new Promise(function(resolve, reject) {
    dispatch(fetchTypeDocumentStarted());
    dispatch(fetch(api.fetchTypeDocument, {}))
      .then(resp => {
        if (resp.code === 'CRG-000') {
          dispatch(fetchTypeDocumentSucceeded(resp.data));
          resolve(resp);
        } else {
          dispatch(fetchTypeDocumentFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
          reject(resp);
        }
      })
      .catch(error => {
        dispatch(fetchTypeDocumentFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
        reject(error);
      });
  });
