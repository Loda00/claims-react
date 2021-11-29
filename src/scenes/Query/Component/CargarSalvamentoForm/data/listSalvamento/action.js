import * as api from 'scenes/Query/Component/CargarSalvamentoForm/data/listSalvamento/api';
import { fetch } from 'services/api/actions';
// import { CONSTANTS_APP } from 'constants/index';

// import { getListSalvamento } from 'scenes/Query/Component/CargarSalvamentoForm/data/listSalvamento/reducer';

export const FETCH_LIST_SALVAMENTO_STARTED =
  'Query/Component/CargarSalvamentoForm/data/listSalvamento/FETCH_LIST_SALVAMENTO_STARTED';
export const FETCH_LIST_SALVAMENTO_FINISHED =
  'Query/Component/CargarSalvamentoForm/data/listSalvamento/FETCH_LIST_SALVAMENTO_FINISHED';
export const FETCH_LIST_SALVAMENTO_RESET =
  'Query/Component/CargarSalvamentoForm/data/listSalvamento/FETCH_LIST_SALVAMENTO_RESET';

export function fetchListSalvamentoStarted() {
  return {
    type: FETCH_LIST_SALVAMENTO_STARTED
  };
}

export function fetchListSalvamentoFinished(listSalvamento) {
  return {
    type: FETCH_LIST_SALVAMENTO_FINISHED,
    payload: {
      listSalvamento
    }
  };
}

export function fetchListSalvamentoReset() {
  return {
    type: FETCH_LIST_SALVAMENTO_RESET
  };
}

export function fetchListSalvamento(numeroSiniestro) {
  return (dispatch, getState) =>
    new Promise(function(resolve, reject) {
      // if(getListSalvamento(getState()).listSalvamento.length > 0 ) return resolve();

      dispatch(fetchListSalvamentoStarted());
      dispatch(fetch(api.fetchListSalvamento, { numeroSiniestro }))
        .then(resp => {
          switch (resp.code) {
            case 'CRG-000':
              dispatch(fetchListSalvamentoFinished(resp.data));
              resolve(resp);
              break;
            default:
              dispatch(fetchListSalvamentoFinished([]));
              reject(resp.message);
          }
        })
        .catch(error => {
          dispatch(fetchListSalvamentoFinished([]));
          reject(error);
        });
    });
}
