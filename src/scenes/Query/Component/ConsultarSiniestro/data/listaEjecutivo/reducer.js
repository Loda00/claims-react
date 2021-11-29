import {
  FETCH_LIST_EJECUTIVOS_STARTED,
  FETCH_LIST_EJECUTIVOS_FINISHED,
  FETCH_LIST_EJECUTIVOS_RESET
} from 'scenes/Query/Component/ConsultarSiniestro/data/listaEjecutivo/action';

const initialState = {
  listaEjecutivo: [],
  isLoading: false
};

export const getListEjecutivo = state => state.scenes.query.component.consultarSiniestro.data.listaEjecutivo;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_LIST_EJECUTIVOS_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_LIST_EJECUTIVOS_FINISHED:
      return {
        ...state,
        isLoading: false,
        listaEjecutivo: action.payload.listaEjecutivo
      };
    case FETCH_LIST_EJECUTIVOS_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
