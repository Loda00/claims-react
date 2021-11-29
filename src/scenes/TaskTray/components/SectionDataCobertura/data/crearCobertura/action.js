import crearCobertura from 'scenes/TaskTray/components/SectionDataCobertura/data/crearCobertura/api';
import { fetch } from 'services/api/actions';

export const FETCH_CREAR_COBERTURA_STARTED = 'FETCH_CREAR_COBERTURA_STARTED';
export const FETCH_CREAR_COBERTURA_FINISHED = 'FETCH_CREAR_COBERTURA_FINISHED';

export const fetcCrearCoberturaStarted = () => {
  return {
    type: FETCH_CREAR_COBERTURA_STARTED
  };
};

export const fetchCrearCoberturaFinished = cobertura => {
  return {
    type: FETCH_CREAR_COBERTURA_FINISHED,
    payload: {
      cobertura
    }
  };
};

export const fetchCrearCobertura = json => {
  return dispatch =>
    new Promise((res, rej) => {
      dispatch(fetcCrearCoberturaStarted());
      dispatch(fetch(crearCobertura, json))
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchCrearCoberturaFinished(resp.data));
            res(resp);
          } else {
            dispatch(fetchCrearCoberturaFinished([]));
            rej(resp.message);
          }
        })
        .catch(e => {
          dispatch(fetchCrearCoberturaFinished([]));
          rej(e);
        });
    });
};
