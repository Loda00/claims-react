import {
  FETCH_CREAR_AUSENCIA_STARTED,
  FETCH_CREAR_AUSENCIA_FINISHED,
  FETCH_CREAR_AUSENCIA_RESET
} from 'scenes/Administracion/data/crearAusencia/action';

const initialState = {
  crearAusencia: [],
  isLoading: false
};

export const crearPersona = state => state.scenes.administracion.data.crearAusencia;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_CREAR_AUSENCIA_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_CREAR_AUSENCIA_FINISHED:
      return {
        ...state,
        isLoading: false
      };
    case FETCH_CREAR_AUSENCIA_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
