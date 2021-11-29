import {
  FETCH_SAVE_SALVAMENTO_STARTED,
  FETCH_SAVE_SALVAMENTO_FINISHED,
  FETCH_SAVE_SALVAMENTO_RESET
} from 'scenes/Query/Component/CargarSalvamentoForm/data/saveSalvamento/action';

const initialState = {
  saveSalvamento: [],
  isLoading: false
};

export const getSaveSalvamento = state => state.scenes.query.component.cargarSalvamento.data.saveSalvamento;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_SAVE_SALVAMENTO_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_SAVE_SALVAMENTO_FINISHED:
      return {
        ...state,
        isLoading: false,
        saveSalvamento: action.payload.saveSalvamento
      };
    case FETCH_SAVE_SALVAMENTO_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
