import {
  FETCH_MEANS_OF_TRANSPORT_STARTED,
  FETCH_MEANS_OF_TRANSPORT_SUCCEEDED,
  FETCH_MEANS_OF_TRANSPORT_FAILED,
  FETCH_MEANS_OF_TRANSPORT_RESET
} from 'scenes/TaskTray/scenes/CompleteTaskInfo/data/meansOfTransport/actions';

const initialState = {
  meansOfTransport: [],
  isLoading: false,
  error: null
};

export const getMeansOfTransport = state => state.scenes.taskTray.completeTaskInfo.data.meansOfTransport;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_MEANS_OF_TRANSPORT_STARTED:
      return {
        ...state,
        isLoading: true
      };
    case FETCH_MEANS_OF_TRANSPORT_SUCCEEDED:
      return {
        ...state,
        isLoading: false,
        meansOfTransport: action.payload.meansOfTransport
      };
    case FETCH_MEANS_OF_TRANSPORT_FAILED:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    case FETCH_MEANS_OF_TRANSPORT_RESET:
      return {
        ...state,
        isLoading: false,
        error: null,
        meansOfTransport: []
      };
    default:
      return state;
  }
};
