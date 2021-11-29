import {
  FETCH_LIST_RAMOS_STARTED,
  FETCH_LIST_RAMOS_FINISHED,
  FETCH_LIST_RAMOS_RESET
} from 'scenes/Administracion/data/listarRamo/action';

const initialState = {
  listarRamo: [],
  isLoading: false
};

export const getListRamo = state => state.scenes.administracion.data.listarRamo;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_LIST_RAMOS_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_LIST_RAMOS_FINISHED:
      return {
        ...state,
        isLoading: false,
        listarRamo: action.payload.listarRamo
      };
    case FETCH_LIST_RAMOS_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
