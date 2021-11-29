import { FETCH_MNT_RAMO_STARTED, FETCH_MNT_RAMO_FINISHED } from 'scenes/Administracion/Ramo/data/mantenerRamo/action';

const initialState = {
  isLoading: false
};

export const getMantenimientoRamo = state => state.scenes.administracion.ramo.data.mantenerRamo;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_MNT_RAMO_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_MNT_RAMO_FINISHED:
      return {
        ...state,
        isLoading: false
      };
    default:
      return state;
  }
};
