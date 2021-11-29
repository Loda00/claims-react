import fetchActualizaPersona from 'scenes/Administracion/data/actualizarPersona/api';
import { fetch } from 'services/api/actions';

export const FETCH_ACT_PERSONA_STARTED = 'Administracion/data/actualizarPersona/FETCH_ACT_PERSONA_STARTED';
export const FETCH_ACT_PERSONA_FINISHED = 'Administracion/data/actualizarPersona/FETCH_ACT_PERSONA_FINISHED';
export const FETCH_ACT_PERSONA_RESET = 'Administracion/data/actualizarPersona/FETCH_ACT_PERSONA_RESET';

export function fetchActualizarPersonaStarted() {
  return {
    type: FETCH_ACT_PERSONA_STARTED
  };
}

export function fetchActualizarPersonaFinished(actualizarPersona) {
  return {
    type: FETCH_ACT_PERSONA_FINISHED,
    payload: {
      actualizarPersona
    }
  };
}

export function fetchActualizarPersonaReset() {
  return {
    type: FETCH_ACT_PERSONA_RESET
  };
}

export const fetchActualizarPersona = (editarUsuario, action, selected, ajustadores, values, jefeState) => dispatch =>
  new Promise((resolve, reject) => {
    const {
      tipoPersonaAgregar,
      idCoreAgregar,
      nombre,
      apellidoPaterno,
      apellidoMaterno,
      emailAgregar,
      cargoAgregar,
      equipoAgregar,
      jefeAgregar,
      ajustadorAgregar,
      accesoReportes = false
    } = values || {};

    let usuariosRoles = [];
    if (values && selected.length > 0) {
      usuariosRoles = selected.map(rol => {
        if (ajustadorAgregar && ajustadorAgregar.length > 6) {
          const ajustadorNoModificado = ajustadores.filter(ajustador => ajustador.nombreAjustador === ajustadorAgregar);
          return {
            idTipo: rol.idTipoUsuario,
            codAjustador: ajustadorNoModificado[0].codAjustador
          };
        }
        return {
          idTipo: rol.idTipoUsuario,
          codAjustador: ajustadorAgregar || null
        };
      });
    }
    const obtenerCrgCargo = () => {
      let cargo = null;
      if (action === 'U' && selected[0].idTipoUsuario === 'AJUST') {
        cargo = null;
      } else if (action === 'U' && typeof cargoAgregar === 'number') {
        cargo = cargoAgregar;
      } else if (action === 'U' && cargoAgregar !== undefined && editarUsuario) {
        cargo = editarUsuario.crgCargo;
      } else {
        cargo = null;
      }
      return cargo;
    };

    const obtenerCrgEquipo = () => {
      let equipo = null;
      if (action === 'U' && selected[0].idTipoUsuario === 'AJUST') {
        equipo = null;
      } else if (action === 'U' && typeof equipoAgregar === 'number') {
        equipo = equipoAgregar;
      } else if (action === 'U' && equipoAgregar !== undefined && editarUsuario) {
        equipo = editarUsuario.crgEquipo;
      } else {
        equipo = null;
      }
      return equipo;
    };

    const obtenerCrgJefe = () => {
      console.log(jefeState);
      if (action === 'U' && selected[0].idTipoUsuario === 'AJUST') {
        const crgJefeAjustador = ajustadores.filter(ajustador => ajustador.codAjustador === ajustadorAgregar);
        return crgJefeAjustador[0].idPersona;
      } else if (action === 'U' && editarUsuario.nombreJefe && editarUsuario.nombreJefe === jefeAgregar) {
        return editarUsuario.crgJefe;
      } else if (action === 'U' && (jefeState !== '' && jefeState !== undefined)) {
        return jefeState;
      } else if (action === 'U' && editarUsuario.crgJefe && (jefeState === '' || jefeState === undefined)) {
        return editarUsuario.crgJefe;
      } 
      return null;
    };

    const data = {
      tipoPersona: tipoPersonaAgregar,
      pkPersona: editarUsuario && editarUsuario.pkPersonaSec ? editarUsuario.pkPersonaSec : null,
      pkPersonaClaims: editarUsuario && editarUsuario.pkPersona ? editarUsuario.pkPersona : null,
      idCore:
        (action === 'U' && parseInt(idCoreAgregar, 10)) ||
        (action === 'D' && editarUsuario && editarUsuario.idCore) ||
        null,
      nombres: (action === 'U' && nombre) || (action === 'D' && editarUsuario && editarUsuario.nombres) || null,
      apePaterno:
        (action === 'U' && apellidoPaterno) || (action === 'D' && editarUsuario && editarUsuario.apePaterno) || null,
      apeMaterno:
        (action === 'U' && apellidoMaterno) || (action === 'D' && editarUsuario && editarUsuario.apeMaterno) || null,
      email: (action === 'U' && emailAgregar) || (action === 'D' && editarUsuario && editarUsuario.email) || null,
      password: editarUsuario && editarUsuario.password ? editarUsuario.password : null,
      tipoDoc: editarUsuario && editarUsuario.tipoDoc ? editarUsuario.tipoDoc : null,
      numDoc: editarUsuario && editarUsuario.numDoc ? editarUsuario.numDoc : null,
      genero: editarUsuario && editarUsuario.genero ? editarUsuario.genero : null,
      fechaNac: editarUsuario && editarUsuario.fechaNac ? editarUsuario.fechaNac.slice(0, 10) : null,
      estCivil: editarUsuario && editarUsuario.estCivil ? editarUsuario.estCivil : null,
      crgCargo: obtenerCrgCargo(),
      crgEquipo: obtenerCrgEquipo(),
      crgJefe: obtenerCrgJefe(),
      crgAplicacion: editarUsuario && editarUsuario.crgAplicacion ? editarUsuario.crgAplicacion : null,
      habilita:
        (action === 'U' && editarUsuario && editarUsuario.habilita) || (action === 'D' && editarUsuario && 'N') || null,
      tipoUsuario:
        (action === 'U' && usuariosRoles.length > 0 && usuariosRoles) ||
        (action === 'D' && editarUsuario && editarUsuario.tipoUsuario) ||
        null,
      operacion: (action === 'U' && 'AP') || (action === 'D' && 'EP'),
      accesoReportes: accesoReportes ? 'S' : 'N'
    };

    if (editarUsuario && action === 'U') {
      console.log({ editarUsuario, cargoAgregar, values });
      Object.assign(data, { actualizarCargo: !Number.isNaN(Number(cargoAgregar)) });
    }
    console.log('data', data);
    
    dispatch(fetchActualizarPersonaStarted());
    dispatch(fetch(fetchActualizaPersona, data))
      .then(resp => {
        if (resp.code === 'CRG-000') {
          dispatch(fetchActualizarPersonaFinished(resp.data));
          resolve(resp);
        } else {
          dispatch(fetchActualizarPersonaFinished([]));
          resolve(resp);
        }
      })
      .catch(error => {
        dispatch(fetchActualizarPersonaFinished([]));
        reject(error.response);
      });
  });
