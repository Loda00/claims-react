import {
  FETCH_ENTIDADES_STARTED,
  FETCH_ENTIDADES_FINISHED
} from 'scenes/TaskTray/components/SectionPayments/data/entidades/actions';

const initialState = {
  entidades: [],
  isLoading: false
};

export const getEntidades = state => state.scenes.taskTray.taskTrayComponents.searchRegistry.data.entidades;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ENTIDADES_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_ENTIDADES_FINISHED:
      return {
        ...state,
        isLoading: false,
        entidades: action.payload.entidades
      };
    default:
      return state;
  }
};
