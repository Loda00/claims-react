import * as api from 'scenes/Query/Component/ConsultarSiniestro/data/reasignar/api';
import { fetch } from 'services/api/actions';

export const FETCH_LIST_REASIGNAR_STARTED =
  'Query/Component/ConsultarSiniestro/data/reasignar/FETCH_LIST_REASIGNAR_STARTED';
export const FETCH_LIST_REASIGNAR_FINISHED =
  'Query/Component/ConsultarSiniestro/data/reasignar/FETCH_LIST_REASIGNAR_FINISHED';
export const FETCH_LIST_REASIGNAR_RESET =
  'Query/Component/ConsultarSiniestro/data/reasignar/FETCH_LIST_REASIGNAR_RESET';

export function fetchListReasignarStarted() {
  return {
    type: FETCH_LIST_REASIGNAR_STARTED
  };
}

export function fetchListReasignarFinished(listarAjustador) {
  return {
    type: FETCH_LIST_REASIGNAR_FINISHED,
    payload: {
      listarAjustador
    }
  };
}

export function fetchListReasignarReset() {
  return {
    type: FETCH_LIST_REASIGNAR_RESET
  };
}

export function fetchListReasignar(personaActual, personaNuevo, siniestro) {
  return (dispatch, getState) =>
    new Promise(function(resolve, reject) {
      const data = {
        personaActual: personaActual || null,
        personaNuevo: parseInt(personaNuevo) || null,
        siniestro: siniestro || null
      };

      dispatch(fetchListReasignarStarted());
      dispatch(fetch(api.fetchListReasignar, data))
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchListReasignarFinished(resp.data));
            resolve(resp);
          } else {
            dispatch(fetchListReasignarFinished([]));
            resolve(resp.message);
          }
        })
        .catch(error => {
          dispatch(fetchListReasignarFinished([]));
        });
    });
}
