import {
  FETCH_ACT_PARAMETRO_NOTIFICACIONES_STARTED,
  FETCH_ACT_PARAMETRO_NOTIFICACIONES_FINISHED,
  FETCH_ACT_PARAMETRO_NOTIFICACIONES_RESET
} from 'scenes/Administracion/data/actualizarParametrosNotificaciones/action';

const initialState = {
  actualizarParametrosNotificacion: [],
  isLoading: false
};

export const actParametrosNotificacion = state => state.scenes.administracion.data.actualizarParametrosNotificaciones;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ACT_PARAMETRO_NOTIFICACIONES_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_ACT_PARAMETRO_NOTIFICACIONES_FINISHED:
      return {
        ...state,
        isLoading: false,
        actualizarParametrosNotificacion: action.payload.actualizarParametrosNotificacion
      };
    case FETCH_ACT_PARAMETRO_NOTIFICACIONES_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
