import {
  FETCH_CREAR_PARAMETRO_STARTED,
  FETCH_CREAR_PARAMETRO_FINISHED,
  FETCH_CREAR_PARAMETRO_RESET
} from 'scenes/Administracion/data/crearParametro/action';

const initialState = {
  crearParametro: [],
  isLoading: false
};

export const crearParametro = state => state.scenes.administracion.data.crearParametro;

export const crearParametroLoading = state => state.scenes.administracion.data.crearParametro.isLoading;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_CREAR_PARAMETRO_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_CREAR_PARAMETRO_FINISHED:
      return {
        ...state,
        isLoading: false,
        crearParametro: action.payload.crearParametro
      };
    case FETCH_CREAR_PARAMETRO_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
