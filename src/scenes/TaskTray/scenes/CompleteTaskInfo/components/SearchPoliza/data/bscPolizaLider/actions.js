import moment from 'moment';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';
import { getParamGeneral } from 'services/types/reducer';
import * as api from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/SearchPoliza/data/bscPolizaLider/api';

export const FETCH_POLIZA_LIDER_STARTED =
  'CompleteTaskInfo/components/SearchPoliza/data/bscPolizaLider/FETCH_POLIZA_LIDER_STARTED';
export const FETCH_POLIZA_LIDER_SUCCEEDED =
  'CompleteTaskInfo/components/SearchPoliza/data/bscPolizaLider/FETCH_POLIZA_LIDER_SUCCEEDED';
export const FETCH_POLIZA_LIDER_FAILED =
  'CompleteTaskInfo/components/SearchPoliza/data/bscPolizaLider/FETCH_POLIZA_LIDER_FAILED';
export const FETCH_POLIZA_LIDER_RESET =
  'CompleteTaskInfo/components/SearchPoliza/data/bscPolizaLider/FETCH_POLIZA_LIDER_RESET';
export const UPDATE_POLIZA_LIDER_META =
  'CompleteTaskInfo/components/SearchPoliza/data/bscPolizaLider/UPDATE_POLIZA_LIDER_META';
export const UPDATE_POLIZA_LIDER_SORT_COLUMN =
  'CompleteTaskInfo/components/SearchPoliza/data/bscPolizaLider/UPDATE_POLIZA_LIDER_SORT_COLUMN';

export function fetchPolizaLiderStarted() {
  return {
    type: FETCH_POLIZA_LIDER_STARTED
  };
}

export function fetchPolizaLiderSucceeded(payload) {
  return {
    type: FETCH_POLIZA_LIDER_SUCCEEDED,
    ...payload
  };
}

export function fetchPolizaLiderFailed(error) {
  return {
    type: FETCH_POLIZA_LIDER_FAILED,
    payload: error
  };
}

export function fetchPolizaLiderReset() {
  return {
    type: FETCH_POLIZA_LIDER_RESET
  };
}

export function updatePage(page = 1) {
  return {
    type: UPDATE_POLIZA_LIDER_META,
    meta: {
      page
    }
  };
}

export function updateSortColumn(sortColumn) {
  return {
    type: UPDATE_POLIZA_LIDER_SORT_COLUMN,
    sortColumn
  };
}

export const fetchPoliza = (values, current) => (dispatch, getState) =>
  new Promise((resolve, reject) => {
    const { fechaOcurrenciaPoLider, polizaLider } = values;
    const tamanioPagina = getParamGeneral(getState(), 'TAMANIO_TABLA_PAGINA');
    const data = {
      codAcepRiesgo: '',
      numPolLider: polizaLider || '',
      stsPol: '',
      fecIniVig:
        fechaOcurrenciaPoLider && fechaOcurrenciaPoLider.length > 0
          ? moment(fechaOcurrenciaPoLider[0]).format(CONSTANTS_APP.FORMAT_DATE_INPUT_CORE)
          : '',
      fecFinVig:
        fechaOcurrenciaPoLider && fechaOcurrenciaPoLider.length > 0
          ? moment(fechaOcurrenciaPoLider[1]).format(CONSTANTS_APP.FORMAT_DATE_INPUT_CORE)
          : '',
      tipRel: '3' /** (Cual es el tipo de relación?) */,
      numPag: current,
      tamPag: tamanioPagina,
      soloValidos: 'S'
    };

    dispatch(fetchPolizaLiderStarted());
    dispatch(fetch(api.fetchPolizaLider, data))
      .then(resp => {
        switch (resp.code) {
          case 'CRG-000':
            dispatch(
              fetchPolizaLiderSucceeded({
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
            dispatch(fetchPolizaLiderReset());
            resolve(resp);
            break;
          default:
            dispatch(
              fetchPolizaLiderFailed({
                message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE
              })
            );
            reject(resp);
        }
      })
      .catch(error => {
        dispatch(
          fetchPolizaLiderFailed({
            message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE
          })
        );
        reject(error);
      });
  });
