import fetchObtienePersona from 'scenes/Administracion/data/obtenerPersona/api';
import { fetch } from 'services/api/actions';

export const FETCH_OBT_PERSONA_STARTED = 'Administracion/data/obtenerPersona/FETCH_OBT_PERSONA_STARTED';
export const FETCH_OBT_PERSONA_FINISHED = 'Administracion/data/obtenerPersona/FETCH_OBT_PERSONA_FINISHED';
export const FETCH_OBT_PERSONA_RESET = 'Administracion/data/obtenerPersona/FETCH_OBT_PERSONA_RESET';

export function fetchObtenerPersonaStarted() {
  return {
    type: FETCH_OBT_PERSONA_STARTED
  };
}

export function fetchObtenerPersonaFinished(obtenerPersona) {
  return {
    type: FETCH_OBT_PERSONA_FINISHED,
    payload: {
      obtenerPersona
    }
  };
}

export function fetchObtenerPersonaReset() {
  return {
    type: FETCH_OBT_PERSONA_RESET
  };
}

export function fetchObtenerPersona(values, tipoPersona) {
  return dispatch =>
    new Promise((resolve, reject) => {
      const { nombres, crgCargo, crgEquipo, email, crgPersona } = values || {};
      const data = {
        nombres: nombres || null,
        crgCargo: crgCargo || null,
        crgEquipo: crgEquipo || null,
        email: email || null,
        crgPersona: crgPersona || null,
        operacion: 'OP',
        tipoPersona: tipoPersona || null
      };
      dispatch(fetchObtenerPersonaStarted());
      dispatch(fetch(fetchObtienePersona, data))
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchObtenerPersonaFinished(resp.data));
            resolve(resp);
          } else {
            dispatch(fetchObtenerPersonaFinished([]));
            reject(resp.message);
          }
        })
        .catch(() => {
          dispatch(fetchObtenerPersonaFinished([]));
        });
    });
}
