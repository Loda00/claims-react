// import anularCobertura from 'scenes/TaskTray/components/SectionDataCobertura/data/anularCobertura/action'
import anularCobertura from 'scenes/TaskTray/components/SectionDataCobertura/data/crearCobertura/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';

export const FETCH_ANULAR_COBERTURA_STARTED = 'FETCH_ANULAR_COBERTURA_STARTED';
export const FETCH_ANULAR_COBERTURA_FINISHED = 'FETCH_ANULAR_COBERTURA_FINISHED';

export const fetcAnularCoberturaStarted = () => {
  return {
    type: FETCH_ANULAR_COBERTURA_STARTED
  };
};

export const fetchAnularCoberturaFinished = cobertura => {
  return {
    type: FETCH_ANULAR_COBERTURA_FINISHED,
    payload: {
      cobertura
    }
  };
};

export const fetchAnularCobertura = json => {
  return dispatch =>
    new Promise((res, rej) => {
      dispatch(fetcAnularCoberturaStarted());
      dispatch(fetch(anularCobertura, json))
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchAnularCoberturaFinished(resp.data));
            res(resp);
          } else {
            dispatch(fetchAnularCoberturaFinished([]));
            rej(resp.message);
          }
        })
        .catch(e => {
          dispatch(fetchAnularCoberturaFinished([]));
          rej(e);
        });
    });
};
