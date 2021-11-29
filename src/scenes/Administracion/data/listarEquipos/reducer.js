import {
  FETCH_LIST_EQUIPOS_STARTED,
  FETCH_LIST_EQUIPOS_FINISHED,
  FETCH_LIST_EQUIPOS_RESET
} from 'scenes/Administracion/data/listarEquipos/action';

const initialState = {
  listarEquipos: [],
  isLoading: false
};

export const getListEquipos = state => state.scenes.administracion.data.listarEquipos;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_LIST_EQUIPOS_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_LIST_EQUIPOS_FINISHED:
      return {
        ...state,
        isLoading: false,
        listarEquipos: action.payload.listarEquipos
      };
    case FETCH_LIST_EQUIPOS_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
