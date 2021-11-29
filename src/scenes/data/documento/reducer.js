import {
  FETCH_SAVE_DOCUMENT_STARTED,
  FETCH_SAVE_DOCUMENT_FINISHED,
  FETCH_SAVE_DOCUMENT_RESET
} from 'scenes/data/documento/action';

const initialState = {
  document: [],
  isLoading: false
};

export const getSaveDocument = state => state.scenes.data.documento;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_SAVE_DOCUMENT_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_SAVE_DOCUMENT_FINISHED:
      return {
        ...state,
        isLoading: false,
        document: action.payload.document
      };
    case FETCH_SAVE_DOCUMENT_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
