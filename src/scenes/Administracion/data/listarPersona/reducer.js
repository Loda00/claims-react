import {
  FETCH_LIST_USUARIOS_STARTED,
  FETCH_LIST_USUARIOS_FINISHED,
  FETCH_LIST_USUARIO_RESET
} from 'scenes/Administracion/data/listarPersona/action';

const initialState = {
  listarPersona: [],
  isLoading: false
};

export const getListPersona = state => state.scenes.administracion.data.listarPersona;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_LIST_USUARIOS_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_LIST_USUARIOS_FINISHED:
      return {
        ...state,
        isLoading: false,
        listarPersona: action.payload.listarPersona
      };
    case FETCH_LIST_USUARIO_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
