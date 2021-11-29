import {
  FETCH_CLOSING_REASONS_STARTED,
  FETCH_CLOSING_REASONS_FINISHED
} from 'scenes/TaskTray/components/SectionDataSinister/data/closingReasons/actions';

const initialState = {
  closingReasons: [],
  isLoading: false
};

export const getClosingReasons = state =>
  state.scenes.taskTray.taskTrayComponents.sectionDataSinister.data.closingReasons;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_CLOSING_REASONS_STARTED:
      return {
        ...state,
        isLoading: true
      };
    case FETCH_CLOSING_REASONS_FINISHED:
      return {
        ...state,
        isLoading: false,
        closingReasons: action.payload.closingReasons
      };
    default:
      return state;
  }
};
