import * as api from 'services/types/api';
import { fetch } from 'services/api/actions';

export const FETCH_INCOTERMS_STARTED = 'SectionDataSinister/data/incoterms/FETCH_INCOTERMS_STARTED';
export const FETCH_INCOTERMS_FINISHED = 'SectionDataSinister/data/incoterms/FETCH_INCOTERMS_FINISHED';

export function fetchIncotermsStarted() {
  return {
    type: FETCH_INCOTERMS_STARTED
  };
}

export function fetchIncotermsFinished(data) {
  return {
    type: FETCH_INCOTERMS_FINISHED,
    payload: {
      isLoading: false,
      incoterms: data
    }
  };
}

export const fetchIncoterms = ruta => dispatch =>
  new Promise((resolve, reject) => {
    dispatch(fetchIncotermsStarted());
    dispatch(fetch(api.fetchTypes, { ruta }))
      .then(resp => {
        if (resp.code === 'CRG-000') {
          dispatch(fetchIncotermsFinished(resp.data));
          resolve(resp);
        } else {
          dispatch(fetchIncotermsFinished([]));
          reject(resp.message);
        }
      })
      .catch(error => {
        dispatch(fetchIncotermsFinished([]));
        reject(error);
      });
  });
