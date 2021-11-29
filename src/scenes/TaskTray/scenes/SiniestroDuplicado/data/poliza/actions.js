import moment from 'moment';
import * as api from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/SearchPoliza/data/policies/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';
import { getParamGeneral } from 'services/types/reducer';

export const FETCH_POLICIES_STARTED = 'FETCH_POLICIES_RG_DUPLICADO_STARTED';
export const FETCH_EXISTING_POLICY_STARTED = 'FETCH_EXISTING_POLICY_RG_DUPLICADO_STARTED';
export const FETCH_POLICIES_SUCCEEDED = 'FETCH_POLICIES_RG_DUPLICADO_SUCCEEDED';
export const FETCH_EXISTING_POLICY_SUCCEEDED = 'FETCH_EXISTING_POLICY_RG_DUPLICADO_SUCCEEDED';
export const FETCH_POLICIES_RESET = 'FETCH_POLICIES_RG_DUPLICADO_RESET';
export const UPDATE_POLICIES_META = 'UPDATE_POLICIES_RG_DUPLICADO_META';
export const UPDATE_POLICIES_SORT_COLUMN = 'UPDATE_POLICIES_RG_DUPLICADO_SORT_COLUMN';
export const FETCH_POLICIES_FAILED = 'FETCH_POLICIES_RG_DUPLICADO_FAILED';

export function fetchPoliciesStarted() {
  return {
    type: FETCH_POLICIES_STARTED
  };
}

export function fetchExistingPolicyStarted() {
  return {
    type: FETCH_EXISTING_POLICY_STARTED
  };
}

export function fetchExistingPolicySucceeded(payload) {
  return {
    type: FETCH_EXISTING_POLICY_SUCCEEDED,
    ...payload
  };
}

export function fetchPoliciesSucceeded(payload) {
  return {
    type: FETCH_POLICIES_SUCCEEDED,
    ...payload
  };
}

export function fetchPoliciesFailed(error) {
  return {
    type: FETCH_POLICIES_FAILED,
    payload: error
  };
}

export function fetchPoliciesReset() {
  return {
    type: FETCH_POLICIES_RESET
  };
}

export function updatePage(page = 1) {
  return {
    type: UPDATE_POLICIES_META,
    meta: {
      page
    }
  };
}

export function updateSortColumn(sortColumn) {
  return {
    type: UPDATE_POLICIES_SORT_COLUMN,
    sortColumn
  };
}

export const fetchPolicies = (values, current) => (dispatch, getState) =>
  new Promise((resolve, reject) => {
    const tamanioPagina = getParamGeneral(getState(), 'TAMANIO_TABLA_PAGINA');

    const asegurado = values.asegurado || {};
    const aseguradoElegido = asegurado.terceroElegido || {};
    const data = {
      codProd: values.producto ? values.producto : '',
      numPol: values.numoDePoliza ? values.numoDePoliza : '',
      stsPol: '',
      fecIniVig:
        values.fechaOcurrencia && values.fechaOcurrencia.length > 0
          ? moment(values.fechaOcurrencia[0]).format(CONSTANTS_APP.FORMAT_DATE_INPUT_CORE)
          : '',
      fecFinVig:
        values.fechaOcurrencia && values.fechaOcurrencia.length > 0
          ? moment(values.fechaOcurrencia[1]).format(CONSTANTS_APP.FORMAT_DATE_INPUT_CORE)
          : '',
      numIdAseg: aseguradoElegido.codExterno,
      tipRel: '3',
      numPag: current,
      tamPag: tamanioPagina,
      soloValidos: 'S'
    };

    dispatch(fetchPoliciesStarted());
    dispatch(fetch(api.fetchPolicies, data))
      .then(resp => {
        switch (resp.code) {
          case 'CRG-000':
            dispatch(
              fetchPoliciesSucceeded({
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
            dispatch(fetchPoliciesReset());
            resolve(resp);
            break;
          default:
            dispatch(
              fetchPoliciesFailed({
                message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE
              })
            );
            reject(resp);
        }
      })
      .catch(error => {
        dispatch(fetchPoliciesFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
        reject(error);
      });
  });

export const fetchExistingPolicy = (numoDePoliza, producto) => dispatch =>
  new Promise((resolve, reject) => {
    dispatch(fetchExistingPolicyStarted());
    dispatch(fetchPolicies({ numoDePoliza, producto }))
      .then(resp => {
        dispatch(
          fetchExistingPolicySucceeded({
            data: resp.data[0]
          })
        );
        resolve(resp);
      })
      .catch(error => {
        reject(error);
      });
  });
