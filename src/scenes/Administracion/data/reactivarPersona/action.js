import fetchReactivaPersona from 'scenes/Administracion/data/reactivarPersona/api';
import { fetch } from 'services/api/actions';

export const FETCH_REACTIVAR_PERSONA_STARTED = 'Administracion/data/reactivarPersona/FETCH_REACTIVAR_PERSONA_STARTED';
export const FETCH_REACTIVAR_PERSONA_FINISHED = 'Administracion/data/reactivarPersona/FETCH_REACTIVAR_PERSONA_FINISHED';
export const FETCH_REACTIVAR_PERSONA_RESET = 'Administracion/data/reactivarPersona/FETCH_REACTIVAR_PERSONA_RESET';

export function fetchReactivarPersonaStarted() {
  return {
    type: FETCH_REACTIVAR_PERSONA_STARTED
  };
}

export function fetchReactivarPersonaFinished(reactivarPersona) {
  return {
    type: FETCH_REACTIVAR_PERSONA_FINISHED,
    payload: {
      reactivarPersona
    }
  };
}

export function fetchReactivarPersonaReset() {
  return {
    type: FETCH_REACTIVAR_PERSONA_RESET
  };
}

export const fetchReactivarPersona = values => dispatch =>
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
      crgCargo,
      crgEquipo,
      crgJefe,
      crgAplicacion: crgAplicacion || null,
      habilita: 'S',
      tipoUsuario: tipoUsuario || null,
      operacion: 'AP'
    };

    dispatch(fetchReactivarPersonaStarted());
    dispatch(fetch(fetchReactivaPersona, data))
      .then(resp => {
        if (resp.code === 'CRG-000') {
          dispatch(fetchReactivarPersonaFinished(resp.data));
          resolve(resp);
        } else {
          dispatch(fetchReactivarPersonaFinished([]));
          resolve(resp);
        }
      })
      .catch(error => {
        dispatch(fetchReactivarPersonaFinished([]));
        reject(error.response);
      });
  });
