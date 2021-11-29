import {
  FETCH_BUSCAR_NOTIFICACIONES_STARTED,
  FETCH_BUSCAR_NOTIFICACIONES_FINISHED,
  FETCH_BUSCAR_NOTIFICACIONES_RESET
} from 'scenes/Administracion/data/buscarNotificaciones/action';

const initialState = {
  buscarNotificaciones: [],
  isLoading: false
};

export const getBuscarNotificaciones = state => {
  return state.scenes.administracion.data.buscarNotificaciones;
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_BUSCAR_NOTIFICACIONES_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_BUSCAR_NOTIFICACIONES_FINISHED:
      return {
        ...state,
        isLoading: false,
        buscarNotificaciones: action.payload.buscarNotificaciones
      };
    case FETCH_BUSCAR_NOTIFICACIONES_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
