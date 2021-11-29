import {
  FETCH_OBT_JEFE_STARTED,
  FETCH_OBT_JEFE_FINISHED,
  FETCH_OBT_JEFE_RESET
} from 'scenes/Administracion/data/obtenerJefes/action';

const initialState = {
  obtenerJefes: [],
  isLoading: false
};

export const getObtenerJefes = state => state.scenes.administracion.data.obtenerJefes;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_OBT_JEFE_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_OBT_JEFE_FINISHED:
      return {
        ...state,
        isLoading: false,
        obtenerJefes: action.payload.obtenerJefe
      };
    case FETCH_OBT_JEFE_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
