import {
  FETCH_BUSCAR_PARAMETROS_STARTED,
  FETCH_BUSCAR_PARAMETROS_FINISHED,
  FETCH_BUSCAR_PARAMETROS_RESET
} from 'scenes/Administracion/data/buscarParametros/action';

const initialState = {
  buscarParametros: [],
  isLoading: false
};

export const getBuscarParametros = state => {
  return state.scenes.administracion.data.buscarParametros;
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_BUSCAR_PARAMETROS_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_BUSCAR_PARAMETROS_FINISHED:
      return {
        ...state,
        isLoading: false,
        buscarParametros: action.payload.buscarParametros
      };
    case FETCH_BUSCAR_PARAMETROS_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
