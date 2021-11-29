import {
  FETCH_MNT_CONSECUENCIA_STARTED,
  FETCH_MNT_CONSECUENCIA_FINISHED
} from 'scenes/Administracion/Consecuencias/data/mantenerConsecuencia/action';

const initialState = {
  isLoading: false
};

export const getMantenimientoConsecuencia = state => state.scenes.administracion.consecuencia.data.mantenerConsecuencia;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_MNT_CONSECUENCIA_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_MNT_CONSECUENCIA_FINISHED:
      return {
        ...state,
        isLoading: false
      };
    default:
      return state;
  }
};
