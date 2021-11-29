import {
  FETCH_LIST_AUSENCIAS_STARTED,
  FETCH_LIST_AUSENCIAS_FINISHED,
  FETCH_LIST_AUSENCIAS_RESET
} from 'scenes/Administracion/data/listarAusencias/action';

const initialState = {
  listarAusencias: [],
  isLoading: false
};

export const getListaAusencia = state => state.scenes.administracion.data.listarAusencias;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_LIST_AUSENCIAS_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_LIST_AUSENCIAS_FINISHED:
      return {
        ...state,
        isLoading: false,
        listarAusencias: action.payload.listarAusencias
      };
    case FETCH_LIST_AUSENCIAS_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
