import {
  FETCH_SUB_TYPE_DOCUMENT_SUCCEEDED,
  FETCH_SUB_TYPE_DOCUMENT_STARTED,
  FETCH_SUB_TYPE_DOCUMENT_FAILED,
  FETCH_SUB_TYPE_DOCUMENT_RESET
} from 'scenes/components/SectionCargarDocumento/data/subTypeDocument/action';

const initialState = {
  subTypeDocument: [],
  isLoading: false,
  error: null
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_SUB_TYPE_DOCUMENT_STARTED:
      return {
        ...initialState,
        isLoading: true
      };

    case FETCH_SUB_TYPE_DOCUMENT_SUCCEEDED:
      return {
        ...state,
        isLoading: false,
        subTypeDocument: action.payload.subTypeDocument
      };

    case FETCH_SUB_TYPE_DOCUMENT_RESET:
      return {
        ...initialState
      };

    case FETCH_SUB_TYPE_DOCUMENT_FAILED:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    default:
      return state;
  }
};
