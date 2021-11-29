import {
  FETCH_SEND_CARGAMASIVA_STARTED,
  FETCH_SEND_CARGAMASIVA_FINISHED
} from 'scenes/CargaMasiva/data/sendCargaMasiva/actions';

const initialState = {
  response: null,
  isValidating: false
};
export const obtenerIsValidatingCargaMasiva = state =>
  state.scenes.cargaMasiva.dataCargaMasiva.sendCargaMasiva.isValidating;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_SEND_CARGAMASIVA_STARTED:
      return {
        ...state,
        isValidating: true
      };
    case FETCH_SEND_CARGAMASIVA_FINISHED:
      return {
        ...state,
        isValidating: false
        // response: action.payload.data,
      };
    default:
      return state;
  }
};
