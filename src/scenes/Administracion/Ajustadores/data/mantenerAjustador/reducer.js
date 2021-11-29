import {
  FETCH_MNT_AJUSTADOR_STARTED,
  FETCH_MNT_AJUSTADOR_FINISHED
} from 'scenes/Administracion/Ajustadores/data/mantenerAjustador/action';

const initialState = {
  isLoading: false
};

export const getMantenimientoAjustador = state => state.scenes.administracion.ajustador.data.mantenerAjustador;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_MNT_AJUSTADOR_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_MNT_AJUSTADOR_FINISHED:
      return {
        ...state,
        isLoading: false
      };
    default:
      return state;
  }
};
