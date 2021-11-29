import {
  FETCH_OBT_PERSONA_STARTED,
  FETCH_OBT_PERSONA_FINISHED,
  FETCH_OBT_PERSONA_RESET
} from 'scenes/Administracion/data/obtenerPersona/action';

const initialState = {
  obtenerPersona: [],
  isLoading: false
};

export const getObtenerPersona = state => state.scenes.administracion.data.obtenerPersona;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_OBT_PERSONA_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_OBT_PERSONA_FINISHED:
      return {
        ...state,
        isLoading: false,
        obtenerPersona: action.payload.obtenerPersona
      };
    case FETCH_OBT_PERSONA_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
