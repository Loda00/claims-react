import moment from 'moment';
import * as api from 'scenes/Query/data/searchSinister/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';

export const FETCH_EXPORT_SEARCH_SINISTER_STARTED = 'Query/data/searchSinister/FETCH_EXPORT_SEARCH_SINISTER_STARTED';
export const FETCH_EXPORT_SEARCH_SINISTER_SUCCEEDED =
  'Query/data/searchSinister/FETCH_EXPORT_SEARCH_SINISTER_SUCCEEDED';
export const FETCH_EXPORT_SINISTER_FAILED = 'Query/data/searchSinister/FETCH_EXPORT_SINISTER_FAILED';
export const FETCH_SEARCH_SINISTER_STARTED = 'Query/data/searchSinister/FETCH_SEARCH_SINISTER_STARTED';
export const FETCH_SEARCH_SINISTER_SUCCEEDED = 'Query/data/searchSinister/FETCH_SEARCH_SINISTER_SUCCEEDED';
export const FETCH_SEARCH_SINISTER_FAILED = 'Query/data/searchSinister/FETCH_SEARCH_SINISTER_FAILED';
export const FETCH_SEARCH_SINISTER_RESET = 'Query/data/searchSinister/FETCH_SEARCH_SINISTER_RESET';
export const UPDATE_SEARCH_SINISTER_META = 'Query/data/searchSinister/UPDATE_SEARCH_SINISTER_META';
export const UPDATE_FILTER = 'Query/data/searchSinister/UPDATE_FILTER';
export const UPDATE_TASK_TABLE_SORT_COLUMN = 'Query/data/searchSinister/UPDATE_TASK_TABLE_SORT_COLUMN';

export function updateFilter(filters) {
  return {
    type: UPDATE_FILTER,
    payload: filters
  };
}

export function fetchExportSearchSinisterStarted() {
  return {
    type: FETCH_EXPORT_SEARCH_SINISTER_STARTED
  };
}

export function fetchExportSearchSinisterSucceeded(payload) {
  return {
    type: FETCH_EXPORT_SEARCH_SINISTER_SUCCEEDED,
    ...payload
  };
}

export function fetchExportSinisterFailed(error) {
  return {
    type: FETCH_EXPORT_SINISTER_FAILED,
    payload: error
  };
}

export function fetchSearchSinisterStarted() {
  return {
    type: FETCH_SEARCH_SINISTER_STARTED
  };
}

export function fetchSearchSinisterSucceeded(payload) {
  return {
    type: FETCH_SEARCH_SINISTER_SUCCEEDED,
    ...payload
  };
}

export function fetchSearchSinisterFailed(error) {
  return {
    type: FETCH_SEARCH_SINISTER_FAILED,
    payload: error
  };
}

export function fetchSearchSinisterReset() {
  return {
    type: FETCH_SEARCH_SINISTER_RESET
  };
}

export function updatePage(page = 1) {
  return {
    type: UPDATE_SEARCH_SINISTER_META,
    meta: {
      page
    }
  };
}

export function updateSortColumn(sortColumn) {
  return {
    type: UPDATE_TASK_TABLE_SORT_COLUMN,
    sortColumn
  };
}

export const fetchSearchSinister = values => (dispatch, getState) =>
  new Promise((resolve, reject) => {
    // const { meta } = getState().scenes.query.data.searchSinister;

    dispatch(fetchSearchSinisterStarted());
    dispatch(fetch(api.fetchSearchSinister, values))
      .then(resp => {
        switch (resp.code) {
          case 'CRG-000':
            dispatch(
              fetchSearchSinisterSucceeded({
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
            dispatch(fetchSearchSinisterReset());
            resolve(resp);
            break;
          default:
            dispatch(fetchSearchSinisterFailed({ message: CONSTANTS_APP.QUERY_ERROR_MESSAGE }));
            resolve(resp);
          // reject(resp);
        }
      })
      .catch(error => {
        dispatch(fetchSearchSinisterFailed({ message: CONSTANTS_APP.QUERY_ERROR_MESSAGE }));
        reject(error);
      });
  });

export const fetchExportSearchSinister = (values, codigoTipo) => (dispatch, getStateExport) =>
  new Promise((resolve, reject) => {
    const { meta } = getStateExport().scenes.query.data.searchSinister;
    const {
      numeroDeSiniestro,
      fechaDeRegistro,
      fechaDeOcurrencia,
      estadoSiniestro,
      producto,
      numeroDePoliza,
      certificado,
      equipo,
      numeroDeCaso,
      siniestroLider,
      numeroPlanilla
    } = values || {};

    const data = {
      siniestroLider: siniestroLider || '',
      numeroPlanilla: numeroPlanilla || '',
      numSiniestro: numeroDeCaso || '',
      codEstadoSiniestro: estadoSiniestro || '',
      idSiniestro: numeroDeSiniestro ? parseInt(numeroDeSiniestro) : '',
      idCaso: '',
      numPoliza: numeroDePoliza || '',
      numCertificado: certificado || certificado === 0 ? parseInt(certificado) : '',
      numIdAsegurado: values.asegurado.terceroElegido ? parseInt(values.asegurado.terceroElegido.codExterno) : '',
      codProducto: producto || '',
      fechaIniOcurrencia:
        fechaDeOcurrencia && fechaDeOcurrencia.length > 0
          ? moment(fechaDeOcurrencia[0]).format(CONSTANTS_APP.FORMAT_DATE_INVERSA)
          : '',
      fechaFinOcurrencia:
        fechaDeOcurrencia && fechaDeOcurrencia.length > 0
          ? moment(fechaDeOcurrencia[1]).format(CONSTANTS_APP.FORMAT_DATE_INVERSA)
          : '',
      fechaIniRegistro:
        fechaDeRegistro && fechaDeRegistro.length > 0
          ? moment(fechaDeRegistro[0]).format(CONSTANTS_APP.FORMAT_DATE_INVERSA)
          : '',
      fechaFinRegistro:
        fechaDeRegistro && fechaDeRegistro.length > 0
          ? moment(fechaDeRegistro[1]).format(CONSTANTS_APP.FORMAT_DATE_INVERSA)
          : '',
      idEquipo: equipo ? parseInt(equipo) : '',
      rolUsuario: codigoTipo || '',
      numPag: 1,
      tamPag: meta.total
    };
    dispatch(fetchExportSearchSinisterStarted());
    dispatch(fetch(api.fetchSearchSinister, data))
      .then(resp => {
        switch (resp.code) {
          case 'CRG-000':
            dispatch(
              fetchExportSearchSinisterSucceeded({
                data: resp.data
              })
            );
            resolve(resp);
            break;
          default:
            dispatch(
              fetchExportSinisterFailed({
                message: CONSTANTS_APP.QUERY_ERROR_MESSAGE
              })
            );
            // reject(resp);
            resolve(resp);
        }
      })
      .catch(error => {
        dispatch(
          fetchExportSinisterFailed({
            message: CONSTANTS_APP.QUERY_ERROR_MESSAGE
          })
        );
        reject(error);
      });
  });
