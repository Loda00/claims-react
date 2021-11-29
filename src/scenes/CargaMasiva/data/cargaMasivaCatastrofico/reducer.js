import {
  FETCH_SEND_CARGAMASIVA_CATASTROFICO_FINISHED,
  FETCH_SEND_CARGAMASIVA_CATASTROFICO_STARTED
} from 'scenes/CargaMasiva/data/cargaMasivaCatastrofico/actions';

const initialState = {
  catastrofico: [],
  isLoading: false
};

export const loading = state => state.scenes.cargaMasiva.dataCargaMasiva.cargaCatastrofico.isLoading;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_SEND_CARGAMASIVA_CATASTROFICO_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_SEND_CARGAMASIVA_CATASTROFICO_FINISHED:
      return {
        ...state,
        isLoading: false,
        catastrofico: action.payload.catastrofico
      };
    default:
      return state;
  }
};
