import {
  FETCH_LIST_RECOVERED_STARTED,
  FETCH_LIST_RECOVERED_FINISHED,
  FETCH_LIS_RECOVERED_RESET
} from 'scenes/TaskTray/components/SectionSalvamentoRecupero/data/listRecovered/action';

const initialState = {
  listRecovered: [],
  isLoading: false
};

export const getListRecovered = state =>
  state.scenes.taskTray.taskTrayComponents.sectionSalvamentoRecupero.data.listRecovered;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_LIST_RECOVERED_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_LIST_RECOVERED_FINISHED:
      return {
        ...state,
        isLoading: false,
        listRecovered: action.payload.listRecovered
      };
    case FETCH_LIS_RECOVERED_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
