import fetchCreaAusencia from 'scenes/Administracion/data/crearAusencia/api';
import { fetch } from 'services/api/actions';

export const FETCH_CREAR_AUSENCIA_STARTED = 'Administracion/data/crearAusencia/FETCH_CREAR_AUSENCIA_STARTED';
export const FETCH_CREAR_AUSENCIA_FINISHED = 'Administracion/data/crearAusencia/FETCH_CREAR_AUSENCIA_FINISHED';
export const FETCH_CREAR_AUSENCIA_RESET = 'Administracion/data/crearAusencia/FETCH_CREAR_AUSENCIA_RESET';

export function fetchCrearAusenciaStarted() {
  return {
    type: FETCH_CREAR_AUSENCIA_STARTED
  };
}

export function fetchCrearAusenciaFinished() {
  return {
    type: FETCH_CREAR_AUSENCIA_FINISHED
  };
}

export function fetchCrearAusenciaReset() {
  return {
    type: FETCH_CREAR_AUSENCIA_RESET
  };
}

export const fetchCrearAusencia = (objUsuYFecha, obtPersona, indSinFin) => dispatch =>
  new Promise((resolve, reject) => {
    const data = {
      crgPersona: obtPersona[0] && obtPersona[0].pkPersona ? obtPersona[0].pkPersona : null,
      fecIniAusencia: objUsuYFecha && objUsuYFecha.fechaInicio ? objUsuYFecha.fechaInicio : null,
      fecFinAusencia: objUsuYFecha && objUsuYFecha.fechaFin ? objUsuYFecha.fechaFin : null,
      habilita: obtPersona[0] && obtPersona[0].habilita ? obtPersona[0].habilita : null,
      operacion: 'CA'
    };

    if (indSinFin && indSinFin === 'S') {
      data.sinFin = indSinFin;
    }

    dispatch(fetchCrearAusenciaStarted());
    dispatch(fetch(fetchCreaAusencia, data))
      .then(resp => {
        if (resp.code === 'CRG-000') {
          dispatch(fetchCrearAusenciaFinished());
          resolve(resp);
        } else {
          dispatch(fetchCrearAusenciaFinished());
          reject(resp.message);
        }
      })
      .catch(error => {
        dispatch(fetchCrearAusenciaFinished());
        reject(error);
      });
  });
