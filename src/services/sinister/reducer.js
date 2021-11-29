import {
  FETCH_SINISTER_SUCCEEDED,
  FETCH_SINISTER_STARTED,
  FETCH_SINISTER_FAILED,
  SAVE_SINISTER_FAILED
} from 'services/sinister/actions';

const initialState = {
  sinister: {},
  isLoading: false,
  error: null,
  errorSave: null
};

export const getSinister = state => state.services.sinister;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_SINISTER_STARTED:
      return {
        ...state,
        isLoading: true
      };
    case FETCH_SINISTER_SUCCEEDED:
      return {
        ...state,
        isLoading: false,
        sinister: action.payload.sinister
      };
    case FETCH_SINISTER_FAILED:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    case SAVE_SINISTER_FAILED:
      return {
        ...state,
        errorSave: action.payload
      };
    default:
      return state;
  }
};
