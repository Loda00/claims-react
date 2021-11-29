import * as api from 'scenes/Query/Component/CargarSalvamentoForm/data/saveSalvamento/api';
import { fetch } from 'services/api/actions';

export const FETCH_SAVE_SALVAMENTO_STARTED =
  'Query/Component/CargarSalvamentoForm/data/saveSalvamento/FETCH_SAVE_SALVAMENTO_STARTED';
export const FETCH_SAVE_SALVAMENTO_FINISHED =
  'Query/Component/CargarSalvamentoForm/data/saveSalvamento/FETCH_SAVE_SALVAMENTO_FINISHED';
export const FETCH_SAVE_SALVAMENTO_RESET =
  'Query/Component/CargarSalvamentoForm/data/saveSalvamento/FETCH_SAVE_SALVAMENTO_RESET';

export function fetchSaveSalvamentoStarted() {
  return {
    type: FETCH_SAVE_SALVAMENTO_STARTED
  };
}

export function fetchSaveSalvamentoFinished(saveSalvamento) {
  return {
    type: FETCH_SAVE_SALVAMENTO_FINISHED,
    payload: {
      saveSalvamento
    }
  };
}

export function fetchSaveSalvamentoReset() {
  return {
    type: FETCH_SAVE_SALVAMENTO_RESET
  };
}

export function fetchSaveSalvamento(numSiniestro, salvamento, rolUsuario) {
  return (dispatch, getState) =>
    new Promise(function(resolve, reject) {
      dispatch(fetchSaveSalvamentoStarted());
      dispatch(fetch(api.fetchSaveSalvamento, { numSiniestro, salvamento, rolUsuario }))
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchSaveSalvamentoFinished(resp.data));
            resolve(resp);
          } else {
            dispatch(fetchSaveSalvamentoFinished([]));
            reject(resp.message);
          }
        })
        .catch(error => {
          dispatch(fetchSaveSalvamentoFinished([]));
        });
    });
}
