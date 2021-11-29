import {
  FETCH_CREAR_SUBPARAMETRO_STARTED,
  FETCH_CREAR_SUBPARAMETRO_FINISHED,
  FETCH_CREAR_SUBPARAMETRO_RESET
} from 'scenes/Administracion/data/crearSubparametro/action';

const initialState = {
  crearSubparametro: [],
  isLoading: false
};

export const crearSubparametro = state => state.scenes.administracion.data.crearSubparametro;

export const crearSubparametroLoading = state => state.scenes.administracion.data.crearSubparametro.isLoading;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_CREAR_SUBPARAMETRO_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_CREAR_SUBPARAMETRO_FINISHED:
      return {
        ...state,
        isLoading: false,
        crearParametro: action.payload.crearSubparametro
      };
    case FETCH_CREAR_SUBPARAMETRO_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
