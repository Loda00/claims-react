import {
  FETCH_DOCUMENT_TYPES_SUCCEEDED,
  FETCH_DOCUMENT_TYPES_STARTED,
  FETCH_DOCUMENT_TYPES_FAILED,
  FETCH_DOCUMENT_TYPES_RESET
} from 'components/SearchInsured/data/documentTypes/actions';

const initialState = {
  documentTypes: [],
  isLoading: false,
  error: null
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_DOCUMENT_TYPES_STARTED:
      return {
        ...state,
        isLoading: true
      };
    case FETCH_DOCUMENT_TYPES_SUCCEEDED:
      return {
        ...state,
        isLoading: false,
        documentTypes: action.payload.documentTypes
      };
    case FETCH_DOCUMENT_TYPES_FAILED:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    case FETCH_DOCUMENT_TYPES_RESET:
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};
