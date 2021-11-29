import {
  FETCH_BSC_PARAM_STARTED,
  FETCH_BSC_PARAM_FINISHED,
  FETCH_BSC_PARAM_RESET
} from 'scenes/Administracion/data/bscParametros/action';

const initialState = {
  bscParametros: [],
  isLoading: false
};

export const getBscParametros = state => state.scenes.administracion.data.bscParametros;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_BSC_PARAM_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_BSC_PARAM_FINISHED:
      return {
        ...state,
        isLoading: false,
        bscParametros: action.payload.bscParametros
      };
    case FETCH_BSC_PARAM_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
