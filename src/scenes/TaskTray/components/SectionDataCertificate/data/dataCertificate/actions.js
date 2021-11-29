import * as api from 'scenes/TaskTray/components/SectionDataCertificate/data/dataCertificate/api';
import { fetch } from 'services/api/actions';

export const FETCH_CERTIFICATE_STARTED = 'SectionDataCertificate/data/dataCertificate/FETCH_CERTIFICATE_STARTED';
export const FETCH_CERTIFICATE_FINISHED = 'SectionDataCertificate/data/dataCertificate/FETCH_CERTIFICATE_FINISHED';
export const FETCH_CERTIFICATE_RESET = 'SectionDataCertificate/data/dataCertificate/FETCH_CERTIFICATE_RESET';

export function fetchCertificateStarted() {
  return {
    type: FETCH_CERTIFICATE_STARTED
  };
}

export function fetchCertificateFinished(data) {
  return {
    type: FETCH_CERTIFICATE_FINISHED,
    payload: {
      isLoading: false,
      data
    }
  };
}

export function fetchCertificateReset() {
  return {
    type: FETCH_CERTIFICATE_RESET
  };
}

export const fetchDataCertificate = numSiniestro => dispatch =>
  new Promise((resolve, reject) => {
    dispatch(fetchCertificateStarted());
    dispatch(fetch(api.fecthDataCertificate, { numSiniestro }))
      .then(resp => {
        if (resp.code === 'CRG-000') {
          dispatch(fetchCertificateFinished(resp.data));
          resolve(resp);
        } else {
          dispatch(fetchCertificateFinished([]));
          reject(resp.message);
        }
      })
      .catch(error => {
        dispatch(fetchCertificateFinished([]));
        reject(error);
      });
  });
