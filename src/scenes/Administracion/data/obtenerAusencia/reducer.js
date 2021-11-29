import {
  FETCH_OBT_AUSENCIA_STARTED,
  FETCH_OBT_AUSENCIA_FINISHED,
  FETCH_OBT_AUSENCIA_RESET
} from 'scenes/Administracion/data/obtenerAusencia/action';

const initialState = {
  obtenerAusencia: [],
  isLoading: false
};

export const getObtenerAusencia = state => state.scenes.administracion.data.obtenerAusencia;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_OBT_AUSENCIA_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_OBT_AUSENCIA_FINISHED:
      return {
        ...state,
        isLoading: false,
        obtenerAusencia: action.payload.obtenerAusencia
      };
    case FETCH_OBT_AUSENCIA_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
