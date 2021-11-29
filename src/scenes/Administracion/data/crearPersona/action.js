import fetchCreaPersona from 'scenes/Administracion/data/crearPersona/api';
import { fetch } from 'services/api/actions';

export const FETCH_CREAR_PERSONA_STARTED = 'Administracion/data/crearPersona/FETCH_CREAR_PERSONA_STARTED';
export const FETCH_CREAR_PERSONA_FINISHED = 'Administracion/data/crearPersona/FETCH_CREAR_PERSONA_FINISHED';
export const FETCH_CREAR_PERSONA_RESET = 'Administracion/data/crearPersona/FETCH_CREAR_PERSONA_RESET';

export function fetchCrearPersonaStarted() {
  return {
    type: FETCH_CREAR_PERSONA_STARTED
  };
}

export function fetchCrearPersonaFinished() {
  return {
    type: FETCH_CREAR_PERSONA_FINISHED
  };
}

export function fetchCrearPersonaReset() {
  return {
    type: FETCH_CREAR_PERSONA_RESET
  };
}

export const fetchCrearPersona = (values, listaAjustadores, selected, jefe) => dispatch =>
  new Promise(async (resolve, reject) => {
    const {
      idCoreAgregar,
      nombre,
      apellidoPaterno,
      apellidoMaterno,
      emailAgregar,
      cargoAgregar,
      equipoAgregar,
      ajustadorAgregar,
      accesoReportes
    } = values || {};

    const idPersonaAjustador = () => {
      if (selected && selected[0].idTipoUsuario === 'AJUST') {
        const crgJefeAjustador = listaAjustadores.filter(ajustador => ajustador.codAjustador === ajustadorAgregar);
        return crgJefeAjustador[0].idPersona;
      }
      if (jefe) {
        return jefe;
      }
      return null;
    };

    const usuariosRoles =
      selected &&
      selected.map(rol => {
        return {
          idTipo: rol.idTipoUsuario,
          codAjustador: ajustadorAgregar || null
        };
      });

    const data = {
      idCore: parseInt(idCoreAgregar, 10) || null,
      nombres: nombre || null,
      apePaterno: apellidoPaterno || null,
      apeMaterno: apellidoMaterno || null,
      email: emailAgregar || null,
      password: null,
      tipoDoc: null,
      numDoc: null,
      genero: null,
      fechaNac: null,
      estCivil: null,
      crgCargo: parseInt(cargoAgregar, 10) ? parseInt(cargoAgregar, 10) : null,
      crgEquipo: parseInt(equipoAgregar, 10) ? parseInt(equipoAgregar, 10) : null,
      crgJefe: idPersonaAjustador(),
      crgAplicacion: 1,
      habilita: 'S',
      tipoUsuario: usuariosRoles.length > 0 ? usuariosRoles : null,
      operacion: 'CP',
      accesoReportes: accesoReportes ? 'S' : 'N'
    };

    dispatch(fetchCrearPersonaStarted());
    dispatch(fetch(fetchCreaPersona, data))
      .then(resp => {
        if (resp.code === 'CRG-000') {
          dispatch(fetchCrearPersonaFinished());
          resolve(resp);
        } else {
          dispatch(fetchCrearPersonaFinished());
          resolve(resp);
        }
      })
      .catch(error => {
        dispatch(fetchCrearPersonaFinished());
        reject(error.response);
      });
  });
