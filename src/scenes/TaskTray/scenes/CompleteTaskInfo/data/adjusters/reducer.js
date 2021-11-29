import {
  FETCH_ADJUSTERS_STARTED,
  FETCH_ADJUSTERS_SUCCEEDED,
  FETCH_ADJUSTERS_FAILED,
  FETCH_ADJUSTERS_RESET
} from 'scenes/TaskTray/scenes/CompleteTaskInfo/data/adjusters/actions';

const initialState = {
  adjusters: [],
  isLoading: false,
  error: null
};

export const getAdjusters = state => state.scenes.taskTray.completeTaskInfo.data.adjusters;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ADJUSTERS_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_ADJUSTERS_RESET:
      return {
        ...initialState
      };
    case FETCH_ADJUSTERS_SUCCEEDED:
      return {
        ...state,
        isLoading: false,
        adjusters: action.payload.adjusters
      };
    case FETCH_ADJUSTERS_FAILED:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    default:
      return state;
  }
};
