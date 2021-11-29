import {
  FETCH_LIST_CONSECUENCIAS_STARTED,
  FETCH_LIST_CONSECUENCIAS_FINISHED,
  FETCH_LIST_CONSECUENCIA_RESET
} from 'scenes/Administracion/data/listarConsecuencia/action';

const initialState = {
  listarConsecuencia: [],
  isLoading: false
};

export const getListConsecuencia = state => state.scenes.administracion.data.listarConsecuencia;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_LIST_CONSECUENCIAS_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_LIST_CONSECUENCIAS_FINISHED:
      return {
        ...state,
        isLoading: false,
        listarConsecuencia: action.payload.listarConsecuencia
      };
    case FETCH_LIST_CONSECUENCIA_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
