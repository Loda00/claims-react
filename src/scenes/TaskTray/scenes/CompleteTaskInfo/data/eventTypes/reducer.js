import {
  FETCH_EVENT_TYPES_STARTED,
  FETCH_EVENT_TYPES_SUCCEEDED,
  FETCH_EVENT_TYPES_FAILED,
  FETCH_EVENT_TYPES_RESET
} from 'scenes/TaskTray/scenes/CompleteTaskInfo/data/eventTypes/actions';

const initialState = {
  eventTypes: [],
  isLoading: false,
  error: null
};

export const getEventTypes = state => state.scenes.taskTray.completeTaskInfo.data.eventTypes;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_EVENT_TYPES_STARTED:
      return {
        ...state,
        isLoading: true
      };
    case FETCH_EVENT_TYPES_SUCCEEDED:
      return {
        ...state,
        isLoading: false,
        eventTypes: action.payload.eventTypes
      };
    case FETCH_EVENT_TYPES_FAILED:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    case FETCH_EVENT_TYPES_RESET:
      return {
        ...state,
        isLoading: false,
        error: null,
        eventTypes: []
      };
    default:
      return state;
  }
};
