import {
  FETCH_CM_TIPO_OPERACION_FINISHED,
  FETCH_CM_TIPO_OPERACION_STARTED,
  FETCH_CM_TIPO_OPERACION_RESET
} from 'scenes/CargaMasiva/data/tipoOperacion/action';

const initialState = {
  tipoOperacion: [],
  isLoading: false
};

export const obtenerTipoOperacion = state => state.scenes.cargaMasiva.dataCargaMasiva.tipoOperacion;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_CM_TIPO_OPERACION_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_CM_TIPO_OPERACION_FINISHED:
      return {
        ...state,
        isLoading: false,
        tipoOperacion: action.payload.tipoOperacion
      };
    case FETCH_CM_TIPO_OPERACION_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
