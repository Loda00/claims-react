import fetchCreaActualizaReemplazo from 'scenes/Administracion/data/crearActualizarReemplazo/api';
import { fetch } from 'services/api/actions';

export const FETCH_CREAR_ACT_REEMPLAZO_STARTED =
  'Administracion/data/crearActualizarReemplazo/FETCH_CREAR_ACT_REEMPLAZO_STARTED';
export const FETCH_CREAR_ACT_REEMPLAZO_FINISHED =
  'Administracion/data/crearActualizarReemplazo/FETCH_CREAR_ACT_REEMPLAZO_FINISHED';
export const FETCH_CREAR_ACT_REEMPLAZO_RESET =
  'Administracion/data/crearActualizarReemplazo/FETCH_CREAR_ACT_REEMPLAZO_RESET';

export function fetchCrearActualizarReemplazoStarted() {
  return {
    type: FETCH_CREAR_ACT_REEMPLAZO_STARTED
  };
}

export function fetchCrearActualizarReemplazoFinished() {
  return {
    type: FETCH_CREAR_ACT_REEMPLAZO_FINISHED
  };
}

export function fetchCrearActualizarReemplazoReset() {
  return {
    type: FETCH_CREAR_ACT_REEMPLAZO_RESET
  };
}

export const fetchCrearActualizarReemplazo = (values, selectedRow) => dispatch =>
  new Promise(function async(resolve, reject) {
    const reemplazosElegidos = values.posiblesReemplazos.map((reemplazo, index) => {
      return {
        crgPersona: reemplazo.crgPersona,
        numOrden: index + 1,
        habilita: reemplazo.indHabilitado || 'S'
      };
    });
    const data = {
      crgPersona: selectedRow && selectedRow[0] ? selectedRow[0].crgPersona : null,
      reemplazos: reemplazosElegidos || null,
      operacion: 'CR'
    };

    dispatch(fetchCrearActualizarReemplazoStarted());
    dispatch(fetch(fetchCreaActualizaReemplazo, data))
      .then(resp => {
        if (resp.code === 'CRG-000') {
          dispatch(fetchCrearActualizarReemplazoFinished());
          resolve(resp);
        } else {
          dispatch(fetchCrearActualizarReemplazoFinished());
          reject(resp.message);
        }
      })
      .catch(error => {
        dispatch(fetchCrearActualizarReemplazoFinished());
        reject(error);
      });
  });
