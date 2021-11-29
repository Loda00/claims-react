import * as api from 'scenes/TaskTray/components/SectionDocumentSinister/data/documents/api';
import { fetch } from 'services/api/actions';

export const FETCH_DOCUMENT_STARTED = 'SectionDocumentSinister/data/documents/FETCH_DOCUMENT_STARTED';
export const FETCH_DOCUMENT_FINISHED = 'SectionDocumentSinister/data/documents/FETCH_DOCUMENT_FINISHED';
export const FETCH_DOCUMENT_RESET = 'SectionDocumentSinister/data/documents/FETCH_DOCUMENT_RESET';

export function fetchDocumentsStarted() {
  return {
    type: FETCH_DOCUMENT_STARTED
  };
}

export function fetchDocumentsFinished(documents) {
  return {
    type: FETCH_DOCUMENT_FINISHED,
    payload: {
      documents
    }
  };
}

export function fetchDocumentsReset() {
  return {
    type: FETCH_DOCUMENT_RESET
  };
}

export function fetchDocuments(numSiniestro, subTipoDocumento) {
  return (dispatch, getState) =>
    new Promise(function(resolve, reject) {
      // if (getDocuments(getState()).documents.length > 0) return resolve();

      dispatch(fetchDocumentsStarted());
      dispatch(fetch(api.fetchDocuments, { numSiniestro, subTipoDocumento }))
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchDocumentsFinished(resp.data));
            resolve(resp);
          } else {
            dispatch(fetchDocumentsFinished([]));
            reject(resp.message);
          }
        })
        .catch(error => {
          dispatch(fetchDocumentsFinished([]));
        });
    });
}
