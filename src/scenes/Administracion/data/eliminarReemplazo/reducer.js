import {
  FETCH_ELIMINAR_REEMPLAZO_STARTED,
  FETCH_ELIMINAR_REEMPLAZO_FINISHED,
  FETCH_ELIMINAR_REEMPLAZO_RESET
} from 'scenes/Administracion/data/eliminarReemplazo/action';

const initialState = {
  eliminarReemplazo: [],
  isLoading: false
};

export const eliminarReemplazo = state => state.scenes.administracion.data.eliminarReemplazo;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ELIMINAR_REEMPLAZO_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_ELIMINAR_REEMPLAZO_FINISHED:
      return {
        ...state,
        isLoading: false
      };
    case FETCH_ELIMINAR_REEMPLAZO_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
