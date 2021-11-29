import fetchEliminaPersona from 'scenes/Administracion/data/eliminarPersona/api';
import { fetch } from 'services/api/actions';

export const FETCH_ELIMINA_PERSONA_STARTED = 'Administracion/data/eliminarPersona/FETCH_ELIMINA_PERSONA_STARTED';
export const FETCH_ELIMINA_PERSONA_FINISHED = 'Administracion/data/eliminarPersona/FETCH_ELIMINA_PERSONA_FINISHED';
export const FETCH_ELIMINA_PERSONA_RESET = 'Administracion/data/eliminarPersona/FETCH_ELIMINA_PERSONA_RESET';

export function fetchEliminarPersonaStarted() {
  return {
    type: FETCH_ELIMINA_PERSONA_STARTED
  };
}

export function fetchEliminarPersonaFinished(eliminarPersona) {
  return {
    type: FETCH_ELIMINA_PERSONA_FINISHED,
    payload: {
      eliminarPersona
    }
  };
}

export function fetchEliminarPersonaReset() {
  return {
    type: FETCH_ELIMINA_PERSONA_RESET
  };
}

export const fetchEliminarPersona = values => dispatch =>
  new Promise((resolve, reject) => {
    const {
      pkPersonaSec,
      pkPersona,
      idCore,
      nombres,
      apePaterno,
      apeMaterno,
      email,
      tipoDoc,
      numDoc,
      genero,
      estCivil,
      crgCargo,
      crgEquipo,
      crgJefe,
      crgAplicacion,
      tipoUsuario
    } = values || {};

    const data = {
      pkPersona: pkPersonaSec || null,
      pkPersonaClaims: pkPersona || null,
      idCore: idCore || null,
      nombres: nombres || null,
      apePaterno: apePaterno || null,
      apeMaterno: apeMaterno || null,
      email: email || null,
      password: null,
      tipoDoc: tipoDoc || null,
      numDoc: numDoc || null,
      genero: genero || null,
      fechaNac: null,
      estCivil: estCivil || null,
      crgCargo: crgCargo || null,
      crgEquipo: crgEquipo || null,
      crgJefe: crgJefe || null,
      crgAplicacion: crgAplicacion || null,
      habilita: 'N',
      tipoUsuario: tipoUsuario || null,
      operacion: 'EP'
    };

    dispatch(fetchEliminarPersonaStarted());
    dispatch(fetch(fetchEliminaPersona, data))
      .then(resp => {
        if (resp.code === 'CRG-000') {
          dispatch(fetchEliminarPersonaFinished(resp.data));
          resolve(resp);
        } else {
          dispatch(fetchEliminarPersonaFinished([]));
          resolve(resp);
        }
      })
      .catch(error => {
        dispatch(fetchEliminarPersonaFinished([]));
        reject(error.response);
      });
  });
