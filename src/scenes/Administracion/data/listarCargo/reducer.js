import {
  FETCH_LIST_CARGO_STARTED,
  FETCH_LIST_CARGO_FINISHED,
  FETCH_LIST_CARGO_RESET
} from 'scenes/Administracion/data/listarCargo/action';

const initialState = {
  listarCargo: [],
  isLoading: false
};

export const getListCargo = state => state.scenes.administracion.data.listarCargo;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_LIST_CARGO_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_LIST_CARGO_FINISHED:
      return {
        ...state,
        isLoading: false,
        listarCargo: action.payload.listarCargo
      };
    case FETCH_LIST_CARGO_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
