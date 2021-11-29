import {
  FETCH_LOCATIONS_STARTED,
  FETCH_LOCATIONS_SUCCEEDED,
  FETCH_LOCATIONS_FAILED,
  FETCH_LOCATIONS_RESET
} from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DireccionSiniestro/data/locations/actions';

const initialState = {
  locations: [],
  isLoading: false,
  error: null
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_LOCATIONS_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_LOCATIONS_RESET:
      return {
        ...initialState
      };
    case FETCH_LOCATIONS_SUCCEEDED:
      return {
        ...state,
        isLoading: false,
        locations: action.payload.locations
      };
    case FETCH_LOCATIONS_FAILED:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    default:
      return state;
  }
};
