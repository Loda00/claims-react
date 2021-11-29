import {
  FETCH_LIST_RAMO_STARTED,
  FETCH_LIST_RAMO_FINISHED,
  FETCH_LIST_RAMO_RESET
} from 'scenes/Administracion/data/listarRamoAjustador/action';

const initialState = {
  listarRamoAjustador: [],
  isLoading: false
};

export const getListRamoAjustador = state => state.scenes.administracion.data.listarRamoAjustador;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_LIST_RAMO_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_LIST_RAMO_FINISHED:
      return {
        ...state,
        isLoading: false,
        listarRamoAjustador: action.payload.listarRamoAjustador
        // listarPersona: action.payload.data,
      };
    case FETCH_LIST_RAMO_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
