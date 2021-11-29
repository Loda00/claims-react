import fetchActualizaUtlParametro from 'scenes/Administracion/data/actualizarUtlParametro/api';
import { fetch } from 'services/api/actions';

export const FETCH_ACT_UTL_PARAMETRO_STARTED =
  'Administracion/data/actualizarUtlParametro/FETCH_ACT_UTL_PARAMETRO_STARTED';
export const FETCH_ACT_UTL_PARAMETRO_FINISHED =
  'Administracion/data/actualizarUtlParametro/FETCH_ACT_UTL_PARAMETRO_FINISHED';
export const FETCH_ACT_UTL_PARAMETRO_RESET = 'Administracion/data/actualizarUtlParametro/FETCH_ACT_UTL_PARAMETRO_RESET';

export function fetchActualizarUtlParametroStarted() {
  return {
    type: FETCH_ACT_UTL_PARAMETRO_STARTED
  };
}

export function fetchActualizarUtlParametroFinished(actualizarUtlParametro) {
  return {
    type: FETCH_ACT_UTL_PARAMETRO_FINISHED,
    payload: {
      actualizarUtlParametro
    }
  };
}

export function fetchActualizarUtlParametroReset() {
  return {
    type: FETCH_ACT_UTL_PARAMETRO_RESET
  };
}

export const fetchActualizarUtlParametro = (values, action) => dispatch =>
  new Promise((resolve, reject) => {
    const { idRuta, codParametro, dscParametro, numOrden, dscTooltip, codTipo, indActivo } = values;

    const data = {
      idRuta,
      codParametro,
      dscParametro,
      numOrden,
      indActivo,
      dscTooltip,
      codTipo
    };

    dispatch(fetchActualizarUtlParametroStarted());
    dispatch(fetch(fetchActualizaUtlParametro, data))
      .then(resp => {
        if (resp.code === 'CRG-000') {
          dispatch(fetchActualizarUtlParametroFinished(resp.data));
          resolve(resp);
        } else {
          dispatch(fetchActualizarUtlParametroFinished([]));
          reject(resp.errorMessage);
        }
      })
      .catch(error => {
        dispatch(fetchActualizarUtlParametroFinished([]));
        reject(error);
      });
  });
