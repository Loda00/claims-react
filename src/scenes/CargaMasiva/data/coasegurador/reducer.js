import {
  FETCH_CM_COASEGURADOR_FINISHED,
  FETCH_CM_COASEGURADOR_STARTED,
  FETCH_CM_COASEGURADOR_RESET
} from 'scenes/CargaMasiva/data/coasegurador/action';

const initialState = {
  coasegurador: [],
  isLoading: false
};

export const obtenerCoasegurador = state => state.scenes.cargaMasiva.dataCargaMasiva.coasegurador;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_CM_COASEGURADOR_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_CM_COASEGURADOR_FINISHED:
      return {
        ...state,
        isLoading: false,
        coasegurador: action.payload.coasegurador
      };
    case FETCH_CM_COASEGURADOR_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
