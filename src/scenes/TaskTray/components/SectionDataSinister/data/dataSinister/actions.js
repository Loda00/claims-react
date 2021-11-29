import * as api from 'scenes/TaskTray/components/SectionDataSinister/data/dataSinister/api';
import { fetch } from 'services/api/actions';
import { isNullOrUndefined } from 'util';
import { CONSTANTS_APP } from 'constants/index';
import { getDataSinister } from './reducer';

export const FETCH_SINISTER_STARTED = 'SectionDataSinister/data/dataSinister/FETCH_SINISTER_STARTED';
export const FETCH_SINISTER_FINISHED = 'SectionDataSinister/data/dataSinister/FETCH_SINISTER_FINISHED';
export const FETCH_SINISTER_RESET = 'SectionDataSinister/data/dataSinister/FETCH_SINISTER_RESET';
export const ACTUALIZAR_MONTO_HONORARIO_CALCULADO_AJUSTADOR =
  'SectionDataSinister/data/dataSinister/FETCH_MONTO_HONORARIO_CALCULADO_AJUSTADOR';

export function fetchSinisterStarted() {
  return {
    type: FETCH_SINISTER_STARTED
  };
}

export function fetchSinisterFinished(data) {
  const verify = isNullOrUndefined(data[0]);
  return {
    type: FETCH_SINISTER_FINISHED,
    payload: {
      isData: verify,
      isLoading: false,
      data
    }
  };
}

export function fetchSinisterReset() {
  return {
    type: FETCH_SINISTER_RESET
  };
}

export const fetchDataSinister = (numSiniestro, idTareaBitacora) => dispatch => {
  return new Promise((resolve, reject) => {
    dispatch(fetchSinisterStarted());
    dispatch(fetch(api.fecthDataSinister, { numSiniestro, idTareaBitacora }))
      .then(resp => {
        if (resp.code === 'CRG-000') {
          dispatch(fetchSinisterFinished(resp.data));
          resolve(resp);
        } else {
          dispatch(fetchSinisterFinished([]));
          reject(resp.code);
        }
      })
      .catch(() => {
        dispatch(fetchSinisterFinished([]));
        reject(CONSTANTS_APP.GENERIC_ERROR_MESSAGE);
      });
  });
};

export function actualizarMontoHonorarioCalculadoAjustador(data) {
  return {
    type: ACTUALIZAR_MONTO_HONORARIO_CALCULADO_AJUSTADOR,
    payload: {
      data
    }
  };
}

export function agregarHonorarioAjustador(ramo, monto) {
  return (dispatch, getState) =>
    new Promise((resolve, reject) => {
      if (monto === undefined) {
        reject(String('Monto calculado no puede ser Undefined'));
      }

      let siniestro = null;
      siniestro = getDataSinister(getState());
      const listaOtrosConceptos = siniestro.listaOtrosConceptos || [];

      const newlistaOtrosConceptos = listaOtrosConceptos.map(concepto => {
        if (concepto.codConcepto === '001' && concepto.codRamo === ramo) {
          return { ...concepto, mtoHonorarioCalculado: monto };
        }
        return { ...concepto };
      });
      const data = [];
      siniestro.listaOtrosConceptos = newlistaOtrosConceptos;
      data.push(siniestro);
      dispatch(actualizarMontoHonorarioCalculadoAjustador(data));
      resolve();
    });
}

export function eliminarHonorarioAjustador(ramo, monto) {
  return (dispatch, getState) =>
    new Promise((resolve, reject) => {
      if (monto === undefined) {
        reject(String('Monto calculado no puede ser Undefined'));
      }

      let siniestro = null;
      siniestro = getDataSinister(getState());
      const listaOtrosConceptos = siniestro.listaOtrosConceptos || [];

      const newlistaOtrosConceptos = listaOtrosConceptos.map(concepto => {
        if (concepto.codConcepto === '001' && concepto.codRamo === ramo) {
          delete concepto.mtoHonorarioCalculado;
          return { ...concepto };
        }
        return { ...concepto };
      });
      const data = [];
      siniestro.listaOtrosConceptos = newlistaOtrosConceptos;
      data.push(siniestro);
      dispatch(actualizarMontoHonorarioCalculadoAjustador(data));
      resolve();
    });
}
