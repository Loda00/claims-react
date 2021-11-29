import crearCobertura from 'scenes/TaskTray/components/SectionDataCobertura/data/crearCobertura/api';
import { fetch } from 'services/api/actions';

export const FETCH_EDITAR_COBERTURA_STARTED = 'FETCH_EDITAR_COBERTURA_STARTED';
export const FETCH_EDITAR_COBERTURA_FINISHED = 'FETCH_EDITAR_COBERTURA_FINISHED';

export const fetcEditarCoberturaStarted = () => {
  return {
    type: FETCH_EDITAR_COBERTURA_STARTED
  };
};

export const fetchEditarCoberturaFinished = cobertura => {
  return {
    type: FETCH_EDITAR_COBERTURA_FINISHED,
    payload: {
      cobertura
    }
  };
};

export const fetchEditarCobertura = json => {
  return dispatch =>
    new Promise((res, rej) => {
      dispatch(fetcEditarCoberturaStarted());
      dispatch(fetch(crearCobertura, json))
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchEditarCoberturaFinished(resp.data));
            res(resp);
          } else {
            dispatch(fetchEditarCoberturaFinished([]));
            rej(resp.message);
          }
        })
        .catch(e => {
          dispatch(fetchEditarCoberturaFinished([]));
          rej(e);
        });
    });
};
