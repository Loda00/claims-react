import {
  FETCH_CM_TIPO_CARGA_RESET,
  FETCH_CM_TIPO_CARGA_FINISHED,
  FETCH_CM_TIPO_CARGA_STARTED
} from 'scenes/CargaMasiva/data/tipoCarga/action';

const initialState = {
  tipoCarga: [],
  isLoading: false
};

export const obtenerTipoCarga = state => state.scenes.cargaMasiva.dataCargaMasiva.tipoCarga;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_CM_TIPO_CARGA_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_CM_TIPO_CARGA_FINISHED:
      return {
        ...state,
        isLoading: false,
        tipoCarga: action.payload.tipoCarga
      };
    case FETCH_CM_TIPO_CARGA_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
