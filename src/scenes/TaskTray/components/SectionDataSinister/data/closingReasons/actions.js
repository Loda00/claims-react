import * as api from 'services/types/api';
import { fetch } from 'services/api/actions';

export const FETCH_CLOSING_REASONS_STARTED = 'SectionDataSinister/data/closingReason/FETCH_CLOSING_REASONS_STARTED';
export const FETCH_CLOSING_REASONS_FINISHED = 'SectionDataSinister/data/closingReason/FETCH_CLOSING_REASONS_FINISHED';

export function fetchClosingReasonsStarted() {
  return {
    type: FETCH_CLOSING_REASONS_STARTED
  };
}

export function fetchClosingReasonsFinished(data) {
  return {
    type: FETCH_CLOSING_REASONS_FINISHED,
    payload: {
      isLoading: false,
      closingReasons: data
    }
  };
}

export const fetchClosingReasons = ruta => dispatch =>
  new Promise((resolve, reject) => {
    dispatch(fetchClosingReasonsStarted());
    dispatch(fetch(api.fetchTypes, { ruta }))
      .then(resp => {
        if (resp.code === 'CRG-000') {
          dispatch(fetchClosingReasonsFinished(resp.data));
          resolve(resp);
        } else {
          dispatch(fetchClosingReasonsFinished([]));
          reject(resp.message);
        }
      })
      .catch(error => {
        dispatch(fetchClosingReasonsFinished([]));
        reject(error);
      });
  });
