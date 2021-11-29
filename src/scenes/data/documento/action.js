/* eslint-disable func-names */

import * as api from 'scenes/data/documento/api';
import { fetch } from 'services/api/actions';

export const FETCH_SAVE_DOCUMENT_STARTED = 'scenes/data/documento/FETCH_SAVE_DOCUMENT_STARTED';
export const FETCH_SAVE_DOCUMENT_FINISHED = 'scenes/data/documento/FETCH_SAVE_DOCUMENT_FINISHED';
export const FETCH_SAVE_DOCUMENT_RESET = 'scenes/data/documento/FETCH_SAVE_DOCUMENT_RESET';

export function fetchSaveDocumentStarted() {
  return {
    type: FETCH_SAVE_DOCUMENT_STARTED
  };
}

export function fetchSaveDocumentFinished(document) {
  return {
    type: FETCH_SAVE_DOCUMENT_FINISHED,
    payload: {
      document
    }
  };
}

export function fetchSaveDocumentReset() {
  return {
    type: FETCH_SAVE_DOCUMENT_RESET
  };
}

export function fetchSaveDocument(validar, numSiniestro, idBitacoraTarea, documentos) {
  return (dispatch, getState) =>
    new Promise(function(resolve, reject) {
      dispatch(fetchSaveDocumentStarted());
      dispatch(fetch(api.fetchSaveDocument, { validar, numSiniestro, idBitacoraTarea, documentos }))
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchSaveDocumentFinished(resp.data));
            resolve(resp);
          } else {
            dispatch(fetchSaveDocumentFinished([]));
            reject(resp.message);
          }
        })
        .catch(error => {
          dispatch(fetchSaveDocumentFinished([]));
        });
    });
}
