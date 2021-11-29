import fetchBuscarNotificacion from 'scenes/Administracion/data/buscarNotificaciones/api';
import { fetch } from 'services/api/actions';

export const FETCH_BUSCAR_NOTIFICACIONES_STARTED =
  'Administracion/data/buscarNotificaciones/FETCH_BUSCAR_NOTIFICACIONES_STARTED';
export const FETCH_BUSCAR_NOTIFICACIONES_FINISHED =
  'Administracion/data/buscarNotificaciones/FETCH_BUSCAR_NOTIFICACIONES_FINISHED';
export const FETCH_BUSCAR_NOTIFICACIONES_RESET =
  'Administracion/data/buscarNotificaciones/FETCH_BUSCAR_NOTIFICACIONES_RESET';

export function fetchBuscarNotificacionesStarted() {
  return {
    type: FETCH_BUSCAR_NOTIFICACIONES_STARTED
  };
}

export function fetchBuscarNotificacionesFinished(buscarNotificaciones) {
  return {
    type: FETCH_BUSCAR_NOTIFICACIONES_FINISHED,
    payload: {
      buscarNotificaciones
    }
  };
}

export function fetchBuscarNotificacionesReset() {
  return {
    type: FETCH_BUSCAR_NOTIFICACIONES_RESET
  };
}

export function fetchBuscarNotificaciones(nombreNotif) {
  return dispatch =>
    new Promise((resolve, reject) => {
      dispatch(fetchBuscarNotificacionesStarted());
      dispatch(fetch(fetchBuscarNotificacion, { nombreNotif }))
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchBuscarNotificacionesFinished(resp.data));
            resolve();
          } else {
            dispatch(fetchBuscarNotificacionesFinished([]));
            reject(resp.message);
          }
        })
        .catch(() => {
          dispatch(fetchBuscarNotificacionesFinished([]));
        });
    });
}
