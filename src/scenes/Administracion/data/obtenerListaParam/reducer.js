import {
  FETCH_LIST_PARAM_STARTED,
  FETCH_LIST_PARAM_FINISHED,
  FETCH_LIST_PARAM_RESET
} from 'scenes/Administracion/data/obtenerListaParam/action';

const initialState = {
  listaParametros: [],
  isLoading: false
};

export const getListaParametros = state => state.scenes.administracion.data.obtenerListaParam;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_LIST_PARAM_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_LIST_PARAM_FINISHED:
      return {
        ...state,
        isLoading: false,
        listaParametros: action.payload.listaParametros
      };
    case FETCH_LIST_PARAM_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
