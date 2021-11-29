import {
  FETCH_ELIMINAR_AUSENCIA_STARTED,
  FETCH_ELIMINAR_AUSENCIA_FINISHED,
  FETCH_ELIMINAR_AUSENCIA_RESET
} from 'scenes/Administracion/data/eliminarAusencia/action';

const initialState = {
  eliminarPersona: [],
  isLoading: false
};

export const crearPersona = state => state.scenes.administracion.data.eliminarPersona;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ELIMINAR_AUSENCIA_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_ELIMINAR_AUSENCIA_FINISHED:
      return {
        ...state,
        isLoading: false
      };
    case FETCH_ELIMINAR_AUSENCIA_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
