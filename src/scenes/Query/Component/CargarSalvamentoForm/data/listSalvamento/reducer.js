import {
  FETCH_LIST_SALVAMENTO_STARTED,
  FETCH_LIST_SALVAMENTO_FINISHED,
  FETCH_LIST_SALVAMENTO_RESET
} from 'scenes/Query/Component/CargarSalvamentoForm/data/listSalvamento/action';

const initialState = {
  listSalvamento: [],
  isLoading: false
};

export const getListSalvamento = state => state.scenes.query.component.cargarSalvamento.data.listSalvamento;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_LIST_SALVAMENTO_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_LIST_SALVAMENTO_FINISHED:
      return {
        ...state,
        isLoading: false,
        listSalvamento: action.payload.listSalvamento
      };
    case FETCH_LIST_SALVAMENTO_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
