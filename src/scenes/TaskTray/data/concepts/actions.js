import * as api from 'services/types/api';
import { fetch } from 'services/api/actions';

import { getConcepts } from 'scenes/TaskTray/data/concepts/reducer';

export const FETCH_CONCEPTS_STARTED = 'scenes/TaskTray/components/SectionPayments/data/concepts/FETCH_CONCEPTS_STARTED';
export const FETCH_CONCEPTS_FINISHED =
  'scenes/TaskTray/components/SectionPayments/data/concepts/FETCH_CONCEPTS_FINISHED';
export const FETCH_CONCEPTS_RESET = 'scenes/TaskTray/components/SectionPayments/data/concepts/FETCH_CONCEPTS_RESET';

export function fetchConceptsStarted() {
  return {
    type: FETCH_CONCEPTS_STARTED
  };
}

export function fetchConceptsFinished(concepts) {
  return {
    type: FETCH_CONCEPTS_FINISHED,
    payload: {
      concepts
    }
  };
}

export function fetchConceptsReset() {
  return {
    type: FETCH_CONCEPTS_RESET
  };
}

export function fetchConcepts(ruta) {
  return (dispatch, getState) =>
    new Promise((resolve, reject) => {
      // if there is data not call API
      if (getConcepts(getState()).concepts.length > 0) return resolve();

      dispatch(fetchConceptsStarted());
      dispatch(fetch(api.fetchTypes, { ruta }))
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchConceptsFinished(resp.data));
            resolve(resp);
          } else {
            dispatch(fetchConceptsFinished([]));
            reject(resp.message);
          }
        })
        .catch(error => {
          dispatch(fetchConceptsFinished([]));
          reject(error);
        });
    });
}
