import fetchActualizaPersonaAusencia from 'scenes/Administracion/data/actPersonaAusencia/api';
import { fetch } from 'services/api/actions';

export const FETCH_ACT_PERSONA_AUSENCIA_STARTED =
  'Administracion/data/actPersonaAusencia/FETCH_ACT_PERSONA_AUSENCIA_STARTED';
export const FETCH_ACT_PERSONA_AUSENCIA_FINISHED =
  'Administracion/data/actPersonaAusencia/FETCH_ACT_PERSONA_AUSENCIA_FINISHED';
export const FETCH_ACT_PERSONA_AUSENCIA_RESET =
  'Administracion/data/actPersonaAusencia/FETCH_ACT_PERSONA_AUSENCIA_RESET';

export function fetchActualizarPersonaAusenciaStarted() {
  return {
    type: FETCH_ACT_PERSONA_AUSENCIA_STARTED
  };
}

export function fetchActualizarPersonaAusenciaFinished(actualizarAusencia) {
  return {
    type: FETCH_ACT_PERSONA_AUSENCIA_FINISHED,
    payload: {
      actualizarAusencia
    }
  };
}

export function fetchActualizarPersonaAusenciaReset() {
  return {
    type: FETCH_ACT_PERSONA_AUSENCIA_RESET
  };
}

export const fetchActualizarPersonaAusencia = (objUsuYFecha, obtuvePersona, pkPersonaAusencia) => dispatch =>
  new Promise((resolve, reject) => {
    const data = {
      crgPersonaAusencia: pkPersonaAusencia || null,
      fecIniAusencia: objUsuYFecha && objUsuYFecha.fechaInicio ? objUsuYFecha.fechaInicio : null,
      fecFinAusencia: objUsuYFecha && objUsuYFecha.fechaFin ? objUsuYFecha.fechaFin : null,
      habilita: obtuvePersona[0] && obtuvePersona[0].habilita ? obtuvePersona[0].habilita : null,
      operacion: 'AA'
    };
    dispatch(fetchActualizarPersonaAusenciaStarted());
    dispatch(fetch(fetchActualizaPersonaAusencia, data))
      .then(resp => {
        if (resp.code === 'CRG-000') {
          dispatch(fetchActualizarPersonaAusenciaFinished(resp.data));
          resolve(resp);
        } else {
          dispatch(fetchActualizarPersonaAusenciaFinished([]));
          reject(resp.message);
        }
      })
      .catch(error => {
        dispatch(fetchActualizarPersonaAusenciaFinished([]));
        reject(error);
      });
  });
