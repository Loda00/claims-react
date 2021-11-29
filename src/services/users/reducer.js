import {
  SWITCH_USER_START,
  SWITCH_USER_FINISHED,
  FETCH_USER_CLAIMS_START,
  FETCH_USER_CLAIMS_SUCCEEDED,
  FETCH_USER_CLAIMS_FAILED,
  SIGNOUT_START,
  SIGNOUT_FINISH,
  LOAD_USER_GLOBAL,
  LOADED_USER_GLOBAL
} from 'services/users/actions';
import { ROLES_USUARIOS } from 'constants/index';

const initialState = {
  user: null,
  userClaims: null,
  isLoadingUserClaims: false,
  isLoading: true,
  errorUserClaims: null,
  loading_out: false,
  isLoadingUserGlobal: false
};

export const getIdCargoBpm = state => {
  const {
    services: {
      user: {
        userClaims: { idCargoBpm = null }
      }
    }
  } = state;

  return idCargoBpm;
};

export const getEsTipoUsuarioEjecutivo = state => {
  const {
    services: {
      user: {
        userClaims: { roles = [] }
      }
    }
  } = state;

  return roles.some(rol => rol.codTipo === ROLES_USUARIOS.EJECUTIVO_DE_SINIESTRO);
};

export const getEsTipoUsuarioAjustador = state => {
  const {
    services: {
      user: {
        userClaims: { roles = [] }
      }
    }
  } = state;

  return roles.some(rol => rol.codTipo === ROLES_USUARIOS.AJUSTADOR);
};

export const getEsTipoUsuarioAprobador = state => {
  const {
    services: {
      user: {
        userClaims: { roles = [] }
      }
    }
  } = state;

  return roles.some(rol => rol.codTipo === ROLES_USUARIOS.APROBADOR);
};
/*
  export const getEsTipoUsuarioRequerido = (state, rolUsuario) => {
    const {
      services: {
        user: {
          userClaims: { roles = [] }
        }
      }
    } = state;

    return roles.some(rol => rol.codTipo === rolUsuario);
  };
*/
export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SWITCH_USER_START:
      return {
        ...state,
        isLoading: true
      };
    case LOAD_USER_GLOBAL:
      return {
        ...state,
        isLoadingUserGlobal: true
      };
    case LOADED_USER_GLOBAL:
      return {
        ...state,
        isLoadingUserGlobal: false
      };
    case SWITCH_USER_FINISHED:
      return {
        ...state,
        isLoading: false,
        user: action.user,
        userClaims: null
      };
    case FETCH_USER_CLAIMS_START:
      return {
        ...state,
        errorUserClaims: null,
        isLoadingUserClaims: true
      };
    case FETCH_USER_CLAIMS_SUCCEEDED:
      return {
        ...state,
        isLoadingUserClaims: false,
        userClaims: action.payload
      };
    case FETCH_USER_CLAIMS_FAILED:
      return {
        ...state,
        isLoadingUserClaims: false,
        errorUserClaims: action.payload
      };
    case SIGNOUT_START:
      return {
        ...state,
        loading_out: true
      };
    case SIGNOUT_FINISH:
      return {
        ...state,
        loading_out: false
      };
    default:
      return state;
  }
};
