import fetchListaReemplazos from 'scenes/Administracion/data/listarPosiblesReemplazos/api';
import { fetch } from 'services/api/actions';

export const FETCH_LIST_REEMPLAZOS_STARTED =
  'Administracion/data/listarPosiblesReemplazos/FETCH_LIST_REEMPLAZOS_STARTED';
export const FETCH_LIST_REEMPLAZOS_FINISHED =
  'Administracion/data/listarPosiblesReemplazos/FETCH_LIST_REEMPLAZOS_FINISHED';
export const FETCH_LIST_REEMPLAZOS_RESET = 'Administracion/data/listarPosiblesReemplazos/FETCH_LIST_REEMPLAZOS_RESET';

export function fetchListReemplazosStarted() {
  return {
    type: FETCH_LIST_REEMPLAZOS_STARTED
  };
}

export function fetchListReemplazosFinished(listarReemplazos) {
  return {
    type: FETCH_LIST_REEMPLAZOS_FINISHED,
    payload: {
      listarReemplazos
    }
  };
}

export function fetchListReemplazosReset() {
  return {
    type: FETCH_LIST_REEMPLAZOS_RESET
  };
}

export function fetchListReemplazos(crgPerson) {
  const data = {
    crgPersona: crgPerson.crgPersona || crgPerson.pkPersona,
    operacion: 'RC'
  };
  // const crgPersona = crgPerson.crgPersona ? crgPerson.crgPersona : crgPerson.pkPersona;
  // const operacion = 'obtreemplazoscandidatos'

  return dispatch =>
    new Promise((resolve, reject) => {
      dispatch(fetchListReemplazosStarted());
      dispatch(fetch(fetchListaReemplazos, data))
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchListReemplazosFinished(resp.data));
            resolve();
          } else {
            dispatch(fetchListReemplazosFinished([]));
            reject(resp.message);
          }
        })
        .catch(() => {
          dispatch(fetchListReemplazosFinished([]));
        });
    });
}
