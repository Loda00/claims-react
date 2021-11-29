import {
  FETCH_MOTIVO_ANULAR_FINISHED,
  FETCH_MOTIVO_ANULAR_STARTED
} from 'scenes/components/Anular/data/motivoAnular/action';

const initialState = {
  motivos: [],
  isLoading: false
};

export const obtenerMotivosAnular = state => state.scenes.query.component.anular.data.motivoAnular;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_MOTIVO_ANULAR_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_MOTIVO_ANULAR_FINISHED:
      return {
        ...state,
        isLoading: false,
        motivos: action.payload.motivos
      };
    default:
      return state;
  }
};
