import {
  FETCH_MOTIVO_FINISHED,
  FETCH_MOTIVO_STARTED
} from 'scenes/Query/Component/Reaperturar/data/motivoReaperturar/action';

const initialState = {
  motivos: [],
  isLoading: false
};

export const obtenerMotivosReaperturar = state => state.scenes.query.component.reaperturar.data.motivoReaperturar;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_MOTIVO_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_MOTIVO_FINISHED:
      return {
        ...state,
        isLoading: false,
        motivos: action.payload.motivos
      };
    default:
      return state;
  }
};
