import {
  FETCH_CREAR_PERSONA_STARTED,
  FETCH_CREAR_PERSONA_FINISHED,
  FETCH_CREAR_PERSONA_RESET
} from 'scenes/Administracion/data/crearPersona/action';

const initialState = {
  crearPersona: [],
  isLoading: false
};

export const crearPersona = state => state.scenes.administracion.data.crearPersona;

export const crearPersonaLoading = state => state.scenes.administracion.data.crearPersona.isLoading;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_CREAR_PERSONA_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_CREAR_PERSONA_FINISHED:
      return {
        ...state,
        isLoading: false
      };
    case FETCH_CREAR_PERSONA_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
