import {
  FETCH_ACT_PERSONA_STARTED,
  FETCH_ACT_PERSONA_FINISHED,
  FETCH_ACT_PERSONA_RESET
} from 'scenes/Administracion/data/actualizarPersona/action';

const initialState = {
  actualizarPersona: [],
  isLoading: false
};

export const actualizarPersona = state => state.scenes.administracion.data.actualizarPersona;

export const actualizarPersonaLoading = state => state.scenes.administracion.data.actualizarPersona.isLoading;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ACT_PERSONA_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_ACT_PERSONA_FINISHED:
      return {
        ...state,
        isLoading: false,
        actualizarPersona: action.payload.actualizarPersona
      };
    case FETCH_ACT_PERSONA_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
