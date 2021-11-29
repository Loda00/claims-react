import {
  FETCH_ELIMINA_PERSONA_STARTED,
  FETCH_ELIMINA_PERSONA_FINISHED,
  FETCH_ELIMINA_PERSONA_RESET
} from 'scenes/Administracion/data/eliminarPersona/action';

const initialState = {
  eliminarPersona: [],
  isLoading: false
};

export const eliminarPersona = state => state.scenes.administracion.data.eliminarPersona;

export const eliminarPersonaLoading = state => state.scenes.administracion.data.eliminarPersona.isLoading;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ELIMINA_PERSONA_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_ELIMINA_PERSONA_FINISHED:
      return {
        ...state,
        isLoading: false,
        eliminarPersona: action.payload.eliminarPersona
      };
    case FETCH_ELIMINA_PERSONA_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
