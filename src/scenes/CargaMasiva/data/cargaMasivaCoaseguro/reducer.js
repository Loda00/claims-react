import {
  FETCH_SEND_CARGAMASIVA_COASEGURO_FINISHED,
  FETCH_SEND_CARGAMASIVA_COASEGURO_STARTED
} from 'scenes/CargaMasiva/data/cargaMasivaCoaseguro/actions';

const initialState = {
  coaseguro: [],
  isLoading: false
};

export const loading = state => state.scenes.cargaMasiva.dataCargaMasiva.cargaCoaseguro.isLoading;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_SEND_CARGAMASIVA_COASEGURO_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_SEND_CARGAMASIVA_COASEGURO_FINISHED:
      return {
        ...state,
        isLoading: false,
        coaseguro: action.payload.coaseguro
      };
    default:
      return state;
  }
};
