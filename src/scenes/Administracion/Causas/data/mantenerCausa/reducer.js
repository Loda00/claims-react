import {
  FETCH_MNT_CAUSA_STARTED,
  FETCH_MNT_CAUSA_FINISHED
} from 'scenes/Administracion/Causas/data/mantenerCausa/action';

const initialState = {
  isLoading: false
};

export const getMantenimientoCausa = state => state.scenes.administracion.causa.data.mantenerCausa;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_MNT_CAUSA_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_MNT_CAUSA_FINISHED:
      return {
        ...state,
        isLoading: false
      };
    default:
      return state;
  }
};
