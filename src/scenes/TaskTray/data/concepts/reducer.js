import {
  FETCH_CONCEPTS_STARTED,
  FETCH_CONCEPTS_FINISHED,
  FETCH_CONCEPTS_RESET
} from 'scenes/TaskTray/data/concepts/actions';

const initialState = {
  concepts: [],
  isLoading: false
};

export const getConcepts = state => state.scenes.taskTray.data.concepts || [];

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_CONCEPTS_STARTED:
      return {
        ...state,
        isLoading: true
      };
    case FETCH_CONCEPTS_FINISHED:
      return {
        ...state,
        isLoading: false,
        concepts: action.payload.concepts
      };
    case FETCH_CONCEPTS_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
