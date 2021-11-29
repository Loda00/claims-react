import {
  FETCH_LIST_ROLES_STARTED,
  FETCH_LIST_ROLES_FINISHED,
  FETCH_LIST_ROLES_RESET
} from 'scenes/Administracion/data/listarRoles/action';

const initialState = {
  listarRoles: [],
  isLoading: false
};

export const getListRoles = state => {
  return state.scenes.administracion.data.listarRoles.listarRoles || [];
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_LIST_ROLES_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_LIST_ROLES_FINISHED:
      return {
        ...state,
        isLoading: false,
        listarRoles: action.payload.listarRoles
      };
    case FETCH_LIST_ROLES_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
