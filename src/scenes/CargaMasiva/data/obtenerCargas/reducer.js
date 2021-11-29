import { FETCH_TIPO_CARGAS_INICIO, FETCH_TIPO_CARGA_TERMINADO } from 'scenes/CargaMasiva/data/obtenerCargas/action';

const initialState = {
  cargas: [],
  isLoading: false
};

export const obtenerTipoCargasMasivas = state => {
  const tipoCargas = state.scenes.cargaMasiva.dataCargaMasiva.tiposCarga.cargas[0] || {};
  return tipoCargas.params || [];
};

export const obtenerIsLoadingTipoCargasMasiva = state => {
  return state.scenes.cargaMasiva.dataCargaMasiva.tiposCarga.isLoading;
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_TIPO_CARGAS_INICIO:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_TIPO_CARGA_TERMINADO:
      return {
        ...state,
        cargas: [action.payload],
        isLoading: false
      };
    default:
      return state;
  }
};
