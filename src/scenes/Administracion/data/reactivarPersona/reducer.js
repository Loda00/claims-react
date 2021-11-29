import {
  FETCH_REACTIVAR_PERSONA_STARTED,
  FETCH_REACTIVAR_PERSONA_FINISHED,
  FETCH_REACTIVAR_PERSONA_RESET
} from 'scenes/Administracion/data/reactivarPersona/action';

const initialState = {
  reactivarPersona: [],
  isLoading: false
};

export const reactivarPersona = state => state.scenes.administracion.data.reactivarPersona;

export const reactivarPersonaLoading = state => state.scenes.administracion.data.reactivarPersona.isLoading;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_REACTIVAR_PERSONA_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_REACTIVAR_PERSONA_FINISHED:
      return {
        ...state,
        isLoading: false,
        reactivarPersona: action.payload.reactivarPersona
      };
    case FETCH_REACTIVAR_PERSONA_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
