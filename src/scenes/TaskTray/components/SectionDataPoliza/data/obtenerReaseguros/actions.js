import { obtenerReaseguros } from 'scenes/TaskTray/components/SectionDataPoliza/data/obtenerReaseguros/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';

export const OBTENER_REASEGUROS_INICIADO = 'OBTENER_REASEGUROS_INICIADO';
export const OBTENER_REASEGUROS_TERMINADO = 'OBTENER_REASEGUROS_TERMINADO';

export function obtenerReasegurosIniciado() {
  return {
    type: OBTENER_REASEGUROS_INICIADO
  };
}

export function obtenerReasegurosTerminado(data) {
  return {
    type: OBTENER_REASEGUROS_TERMINADO,
    payload: {
      data
    }
  };
}

export function fetchObtenerReaseguros(secRamo) {
  return dispatch =>
    new Promise((resolve, reject) => {
      dispatch(obtenerReasegurosIniciado());
      dispatch(
        fetch(obtenerReaseguros, {
          secRamo
        })
      )
        .then(resp => {
          switch (resp.code) {
            case 'CRG-000':
              dispatch(obtenerReasegurosTerminado(resp.data));
              resolve(resp);
              break;
            default:
              dispatch(obtenerReasegurosTerminado([]));
              reject(resp.message);
          }
        })
        .catch(() => {
          dispatch(obtenerReasegurosTerminado([]));
          reject(CONSTANTS_APP.GENERIC_ERROR_MESSAGE);
        });
    });
}
