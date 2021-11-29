import {
  FETCH_OBT_REEMPLAZO_STARTED,
  FETCH_OBT_REEMPLAZO_FINISHED,
  FETCH_OBT_REEMPLAZO_RESET
} from 'scenes/Administracion/data/obtenerReemplazos/action';

const initialState = {
  obtenerReemplazos: [],
  isLoading: false
};

export const getObtenerReemplazo = state => state.scenes.administracion.data.obtenerReemplazos;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_OBT_REEMPLAZO_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_OBT_REEMPLAZO_FINISHED:
      return {
        ...state,
        isLoading: false,
        obtenerReemplazos: action.payload.obtenerReemplazos
      };
    case FETCH_OBT_REEMPLAZO_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
