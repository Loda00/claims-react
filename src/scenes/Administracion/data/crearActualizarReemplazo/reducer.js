import {
  FETCH_CREAR_ACT_REEMPLAZO_STARTED,
  FETCH_CREAR_ACT_REEMPLAZO_FINISHED,
  FETCH_CREAR_ACT_REEMPLAZO_RESET
} from 'scenes/Administracion/data/crearActualizarReemplazo/action';

const initialState = {
  crearActualizarReemplazo: [],
  isLoading: false
};

export const crearActualizarReemplazo = state => state.scenes.administracion.data.crearActualizarReemplazo;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_CREAR_ACT_REEMPLAZO_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_CREAR_ACT_REEMPLAZO_FINISHED:
      return {
        ...state,
        isLoading: false
      };
    case FETCH_CREAR_ACT_REEMPLAZO_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
