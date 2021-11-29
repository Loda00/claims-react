import {
  FETCH_STATE_SINISTER_SUCCEEDED,
  FETCH_STATE_SINISTER_STARTED,
  FETCH_STATE_SINISTER_FAILED
} from 'scenes/Query/data/stateSinister/action';

const initialState = {
  stateSinister: [],
  isLoading: false,
  error: null
};

// export const getStateSinister = state =>  state.

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_STATE_SINISTER_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_STATE_SINISTER_SUCCEEDED:
      return {
        ...state,
        isLoading: false,
        stateSinister: action.payload.stateSinister
      };
    case FETCH_STATE_SINISTER_FAILED:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    default:
      return state;
  }
};
