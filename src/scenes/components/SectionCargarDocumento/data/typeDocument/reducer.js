import {
  FETCH_TYPE_DOCUMENT_SUCCEEDED,
  FETCH_TYPE_DOCUMENT_STARTED,
  FETCH_TYPE_DOCUMENT_FAILED,
  FETCH_TYPE_DOCUMENT_RESET
} from 'scenes/components/SectionCargarDocumento/data/typeDocument/action';

const initialState = {
  typeDocument: [],
  isLoading: false,
  error: null
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_TYPE_DOCUMENT_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_TYPE_DOCUMENT_SUCCEEDED:
      return {
        ...state,
        isLoading: false,
        typeDocument: action.payload.typeDocument
      };
    case FETCH_TYPE_DOCUMENT_RESET:
      return {
        ...initialState
      };
    case FETCH_TYPE_DOCUMENT_FAILED:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    default:
      return state;
  }
};
