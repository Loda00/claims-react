import {
  FETCH_LIST_REEMPLAZOS_STARTED,
  FETCH_LIST_REEMPLAZOS_FINISHED,
  FETCH_LIST_REEMPLAZOS_RESET
} from 'scenes/Administracion/data/listarPosiblesReemplazos/action';

const initialState = {
  listarReemplazos: [],
  isLoading: false
};

export const getListPosiblesReemplazos = state => {
  return state.scenes.administracion.data.listarPosiblesReemplazos;
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_LIST_REEMPLAZOS_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_LIST_REEMPLAZOS_FINISHED:
      return {
        ...state,
        isLoading: false,
        listarReemplazos: action.payload.listarReemplazos
      };
    case FETCH_LIST_REEMPLAZOS_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
