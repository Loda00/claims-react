import * as api from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/SearchCertificado/data/certificates/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';
import { getParamGeneral } from 'services/types/reducer';

export const FETCH_EXISTING_CERTIFICATES_STARTED = 'FETCH_EXISTING_CERTIFICATES_RG_DUPLICADO_STARTED';
export const FETCH_CERTIFICATES_STARTED = 'FETCH_CERTIFICATES_RG_DUPLICADO_STARTED';
export const FETCH_CERTIFICATES_SUCCEEDED = 'FETCH_CERTIFICATES_RG_DUPLICADO_SUCCEEDED';
export const FETCH_EXISTING_CERTIFICATES_SUCCEEDED = 'FETCH_EXISTING_CERTIFICATES_RG_DUPLICADO_SUCCEEDED';
export const FETCH_CERTIFICATES_RESET = 'FETCH_CERTIFICATES_RG_DUPLICADO_RESET';
export const FETCH_CERTIFICATES_FAILED = 'FETCH_CERTIFICATES_RG_DUPLICADO_FAILED';
export const UPDATE_CERTIFICATES_META = 'UPDATE_CERTIFICATES_RG_DUPLICADO_META';
export const UPDATE_CERTIFICATES_SORT_COLUMN = 'UPDATE_CERTIFICATES_RG_DUPLICADO_SORT_COLUMN';

export function fetchCertificatesStarted() {
  return {
    type: FETCH_CERTIFICATES_STARTED
  };
}

export function fetchExistingCertificateStarted() {
  return {
    type: FETCH_EXISTING_CERTIFICATES_STARTED
  };
}

export function fetchExistingCertificateSucceeded(payload) {
  return {
    type: FETCH_EXISTING_CERTIFICATES_SUCCEEDED,
    ...payload
  };
}

export function fetchCertificatesSucceeded(payload) {
  return {
    type: FETCH_CERTIFICATES_SUCCEEDED,
    ...payload
  };
}

export function fetchCertificatesFailed(error) {
  return {
    type: FETCH_CERTIFICATES_FAILED,
    payload: error
  };
}

export function updatePage(page = 1) {
  return {
    type: UPDATE_CERTIFICATES_META,
    meta: {
      page
    }
  };
}

export function updateSortColumn(sortColumn) {
  return {
    type: UPDATE_CERTIFICATES_SORT_COLUMN,
    sortColumn
  };
}

export function fetchCertificatesReset() {
  return {
    type: FETCH_CERTIFICATES_RESET
  };
}

export const fetchCertificates = (idePol, codProd, numPol, values, current) => (dispatch, getState) =>
  new Promise(function(resolve, reject) {
    const tamanioPagina = getParamGeneral(getState(), 'TAMANIO_TABLA_PAGINA');
    const { planilla, aplicacion, certificado, idDeclaracion } = values || {};
    const data = {
      codProd: codProd || '',
      idePol: idePol || '',
      numPol: numPol || '',
      numCert: certificado || '',
      ideDec: idDeclaracion || '',
      planilla: planilla || '',
      aplicacion: aplicacion || '',
      nomAseg: '',
      apePatAseg: '',
      apeMatAseg: '',
      fecOcurr: '',
      numPag: current,
      tamPag: tamanioPagina
    };

    dispatch(fetchCertificatesStarted());
    dispatch(fetch(api.fetchCertificates, data))
      .then(resp => {
        switch (resp.code) {
          case 'CRG-000':
            dispatch(
              fetchCertificatesSucceeded({
                data: resp.data,
                meta: {
                  page: resp.paginacion.numPag,
                  pageSize: resp.paginacion.tamPag,
                  total: resp.paginacion.totalItems
                }
              })
            );
            resolve(resp);
            break;
          case 'CRG-204':
            dispatch(fetchCertificatesReset());
            resolve(resp);
            break;
          default:
            dispatch(fetchCertificatesFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
            reject(resp);
        }
      })
      .catch(error => {
        dispatch(fetchCertificatesFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
        reject(error);
      });
  });

export const fetchExistingCertificate = (idePol, codProd, numPol, certificado, idDeclaracion) => dispatch =>
  new Promise(function(resolve, reject) {
    dispatch(fetchExistingCertificateStarted());
    dispatch(fetchCertificates(idePol, codProd, numPol, { certificado, idDeclaracion }))
      .then(resp => {
        dispatch(
          fetchExistingCertificateSucceeded({
            data: resp.data[0]
          })
        );
        resolve(resp);
      })
      .catch(error => {
        reject(error);
      });
  });
