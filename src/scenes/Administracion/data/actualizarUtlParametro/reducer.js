import {
  FETCH_ACT_UTL_PARAMETRO_STARTED,
  FETCH_ACT_UTL_PARAMETRO_FINISHED,
  FETCH_ACT_UTL_PARAMETRO_RESET
} from 'scenes/Administracion/data/actualizarUtlParametro/action';

const initialState = {
  actualizarUtlParametro: [],
  isLoading: false
};

export const actUtlParametro = state => state.scenes.administracion.data.actualizarUtlParametro;
export const actUtlParametroLoading = state => state.scenes.administracion.data.actualizarUtlParametro.isLoading;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ACT_UTL_PARAMETRO_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_ACT_UTL_PARAMETRO_FINISHED:
      return {
        ...state,
        isLoading: false,
        actualizarUtlParametro: action.payload.actualizarUtlParametro
      };
    case FETCH_ACT_UTL_PARAMETRO_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
