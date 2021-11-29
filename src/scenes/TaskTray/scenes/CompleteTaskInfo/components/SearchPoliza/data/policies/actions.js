import moment from 'moment';
import * as api from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/SearchPoliza/data/policies/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';
import { getParamGeneral } from 'services/types/reducer';

export const FETCH_POLICIES_STARTED = 'CompleteTaskInfo/components/SearchPoliza/data/policies/FETCH_POLICIES_STARTED';
export const FETCH_EXISTING_POLICY_STARTED =
  'CompleteTaskInfo/components/SearchPoliza/data/policies/FETCH_EXISTING_POLICY_STARTED';
export const FETCH_POLICIES_SUCCEEDED =
  'CompleteTaskInfo/components/SearchPoliza/data/policies/FETCH_POLICIES_SUCCEEDED';
export const FETCH_EXISTING_POLICY_SUCCEEDED =
  'CompleteTaskInfo/components/SearchPoliza/data/policies/FETCH_EXISTING_POLICY_SUCCEEDED';
export const FETCH_POLICIES_RESET = 'CompleteTaskInfo/components/SearchPoliza/data/policies/FETCH_POLICIES_RESET';
export const UPDATE_POLICIES_META = 'CompleteTaskInfo/components/SearchPoliza/data/policies/UPDATE_POLICIES_META';
export const UPDATE_POLICIES_SORT_COLUMN =
  'CompleteTaskInfo/components/SearchPoliza/data/policies/UPDATE_POLICIES_SORT_COLUMN';
export const FETCH_POLICIES_FAILED = 'CompleteTaskInfo/components/SearchPoliza/data/policies/FETCH_POLICIES_FAILED';

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

export const fetchExistingPolicy = (idePol, numCert, siniestroInicial = {}) => dispatch =>
  new Promise((resolve, reject) => {
    dispatch(fetchExistingPolicyStarted());
    console.log({
      cm: siniestroInicial.indCargaMasiva,
      codCoaLider: siniestroInicial.codAseguradorLider,
      nomCoaLider: siniestroInicial.nomAseguradorLider
    });
    dispatch(fetch(api.fetchDetallePoliza, { idePol, numCert, soloValidos: 'S' }))
      .then(resp => {
        if (resp.code === 'CRG-000') {
          const coasegurosDetPol = resp.data.listCoasegurador || [];
          const codigoCoa = siniestroInicial.codAseguradorLider;
          const esCMCoaseguro = siniestroInicial.indCargaMasiva === 'COA';
          const existeCoaseguroEnPoliza = coasegurosDetPol.some(coarec => coarec.codCoaseg === codigoCoa);

          if (esCMCoaseguro && !existeCoaseguroEnPoliza) {
            dispatch(
              fetchExistingPolicySucceeded({
                data: {}
              })
            );
            reject('DetallePolizaNotFound');
          } else {
            dispatch(
              fetchExistingPolicySucceeded({
                data: resp.data
              })
            );
            resolve(resp.data);
          }
        } else if (resp.code === 'CRG-204') {
          dispatch(
            fetchExistingPolicySucceeded({
              data: {}
            })
          );
          reject('No se encontró un detalle para la póliza seleccionada');
        } else {
          dispatch(
            fetchExistingPolicySucceeded({
              data: {}
            })
          );
          reject('Ocurrió un error al obtener el detalle de la póliza, por favor, intente nuevamente');
        }
      })
      .catch(error => {
        dispatch(
          fetchExistingPolicySucceeded({
            data: {}
          })
        );
        reject('Ocurrió un error inesperado al obtener el detalle de la póliza');
      });
  });
