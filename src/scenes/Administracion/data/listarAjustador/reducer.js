import {
  FETCH_LIST_AJUSTADORES_STARTED,
  FETCH_LIST_AJUSTADORES_FINISHED,
  FETCH_LIST_AJUSTADORES_RESET
} from 'scenes/Administracion/data/listarAjustador/action';

const initialState = {
  listarAjustador: [],
  isLoading: false
};

export const getListAjustador = state => state.scenes.administracion.data.listarAjustador;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_LIST_AJUSTADORES_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_LIST_AJUSTADORES_FINISHED:
      return {
        ...state,
        isLoading: false,
        listarAjustador: action.payload.listarAjustador
      };
    case FETCH_LIST_AJUSTADORES_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
