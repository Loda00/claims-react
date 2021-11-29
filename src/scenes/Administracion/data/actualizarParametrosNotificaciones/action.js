import fetchActualizarParametrosNotificacion from 'scenes/Administracion/data/actualizarParametrosNotificaciones/api';
import { fetch } from 'services/api/actions';

export const FETCH_ACT_PARAMETRO_NOTIFICACIONES_STARTED =
  'Administracion/data/actualizarParametrosNotificaciones/FETCH_ACT_PARAMETRO_NOTIFICACIONES_STARTED';
export const FETCH_ACT_PARAMETRO_NOTIFICACIONES_FINISHED =
  'Administracion/data/actualizarParametrosNotificaciones/FETCH_ACT_PARAMETRO_NOTIFICACIONES_FINISHED';
export const FETCH_ACT_PARAMETRO_NOTIFICACIONES_RESET =
  'Administracion/data/actualizarParametrosNotificaciones/FETCH_ACT_PARAMETRO_NOTIFICACIONES_RESET';

export function fetchActualizarParametrosNotificacionesStarted() {
  return {
    type: FETCH_ACT_PARAMETRO_NOTIFICACIONES_STARTED
  };
}

export function fetchActualizarParametrosNotificacionesFinished(actualizarAusencia) {
  return {
    type: FETCH_ACT_PARAMETRO_NOTIFICACIONES_FINISHED,
    payload: {
      actualizarAusencia
    }
  };
}

export function fetchActualizarParametrosNotificacionesReset() {
  return {
    type: FETCH_ACT_PARAMETRO_NOTIFICACIONES_RESET
  };
}

export const fetchActualizarParametrosNotificaciones = values => dispatch =>
  new Promise((resolve, reject) => {
    const {
      notification,
      notificationsStart,
      notificationDuration,
      ConditionTwoFrequencySending,
      indicadorcopia2,
      ConditionTwoNumSending,
      ConditionThreeFrequencySending,
      indicadorcopia3,
      ConditionThreeNumSending,
      estado,
      comentario
    } = values;

    const data = {
      nombretemplate: notification,
      diasinicio: notificationsStart,
      diastotal: notificationDuration,
      diasfrec2: ConditionTwoFrequencySending,
      ccopiacond2: indicadorcopia2,
      ccopiacuando2: ConditionTwoNumSending,
      diasfrec3: ConditionThreeFrequencySending,
      ccopiacond3: indicadorcopia3,
      ccopiacuando3: ConditionThreeNumSending,
      stsactual: estado,
      comentario
    };

    dispatch(fetchActualizarParametrosNotificacionesStarted());
    dispatch(fetch(fetchActualizarParametrosNotificacion, data))
      .then(resp => {
        if (resp.code === 'CRG-000') {
          dispatch(fetchActualizarParametrosNotificacionesFinished(resp.data));
          resolve(resp);
        } else {
          dispatch(fetchActualizarParametrosNotificacionesFinished([]));
          reject(resp.message);
        }
      })
      .catch(error => {
        dispatch(fetchActualizarParametrosNotificacionesFinished([]));
        reject(error);
      });
  });
