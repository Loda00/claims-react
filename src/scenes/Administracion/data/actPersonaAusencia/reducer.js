import {
  FETCH_ACT_PERSONA_AUSENCIA_STARTED,
  FETCH_ACT_PERSONA_AUSENCIA_FINISHED,
  FETCH_ACT_PERSONA_AUSENCIA_RESET
} from 'scenes/Administracion/data/actPersonaAusencia/action';

const initialState = {
  actualizarAusencia: [],
  isLoading: false
};

export const actPersonaAusencia = state => state.scenes.administracion.data.actPersonaAusencia;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ACT_PERSONA_AUSENCIA_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_ACT_PERSONA_AUSENCIA_FINISHED:
      return {
        ...state,
        isLoading: false,
        actualizarAusencia: action.payload.actualizarAusencia
      };
    case FETCH_ACT_PERSONA_AUSENCIA_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
