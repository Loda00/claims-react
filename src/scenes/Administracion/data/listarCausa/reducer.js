import {
  FETCH_LIST_CAUSAS_STARTED,
  FETCH_LIST_CAUSAS_FINISHED,
  FETCH_LIST_CAUSAS_RESET
} from 'scenes/Administracion/data/listarCausa/action';

const initialState = {
  listarCausa: [],
  isLoading: false
};

export const getListCausa = state => state.scenes.administracion.data.listarCausa;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_LIST_CAUSAS_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_LIST_CAUSAS_FINISHED:
      return {
        ...state,
        isLoading: false,
        listarCausa: action.payload.listarCausa
      };
    case FETCH_LIST_CAUSAS_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
