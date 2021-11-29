import { obtenerDatosInforme } from 'scenes/TaskTray/components/SectionDataReport/data/datosInforme/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';

export const FETCH_DATOS_INFORME_STARTED = 'FETCH_DATOS_INFORME_STARTED';
export const FETCH_DATOS_INFORME_FINISHED = 'FETCH_DATOS_INFORME_FINISHED';
export const FETCH_DATOS_INFORME_RESET = 'FETCH_DATOS_INFORME_FINISHED';

export const fetchDatosInformeStarted = () => {
  return {
    type: FETCH_DATOS_INFORME_STARTED
  };
};

export const fetchDatosInformeFinished = datosInforme => {
  return {
    type: FETCH_DATOS_INFORME_FINISHED,
    payload: {
      datosInforme
    }
  };
};

export const datosInformesReset = () => {
  return {
    type: FETCH_DATOS_INFORME_RESET,
    payload: {
      datosInforme: []
    }
  };
};

export const fetchDatosInforme = numSiniestro => {
  return dispatch =>
    new Promise((res, rej) => {
      dispatch(fetchDatosInformeStarted());
      dispatch(
        fetch(obtenerDatosInforme, {
          numSiniestro
        })
      )
        .then(resp => {
          switch (resp.code) {
            case 'CRG-000':
              dispatch(fetchDatosInformeFinished(resp.data));
              res(resp);
              break;
            default:
              dispatch(fetchDatosInformeFinished([]));
              rej(resp.message);
          }
        })
        .catch(() => {
          dispatch(fetchDatosInformeFinished([]));
          rej(CONSTANTS_APP.GENERIC_ERROR_MESSAGE);
        });
    });
};
