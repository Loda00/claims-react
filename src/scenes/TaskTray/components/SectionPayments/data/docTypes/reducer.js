import {
  FETCH_DOC_TYPES_STARTED,
  FETCH_DOC_TYPES_SUCCEEDED,
  FETCH_DOC_TYPES_FAILED,
  FETCH_DOC_TYPES_RESET
} from 'scenes/TaskTray/components/SectionPayments/data/docTypes/actions';

const initialState = {
  docTypes: [],
  isLoading: false,
  error: null
};

export const getDocTypes = state => state.scenes.taskTray.taskTrayComponents.searchRegistry.data.docTypes;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_DOC_TYPES_STARTED:
      return {
        ...state,
        isLoading: true
      };
    case FETCH_DOC_TYPES_SUCCEEDED:
      return {
        ...state,
        isLoading: false,
        docTypes: action.payload.docTypes
      };
    case FETCH_DOC_TYPES_FAILED:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    case FETCH_DOC_TYPES_RESET:
      return {
        ...state,
        isLoading: false,
        error: null,
        docTypes: []
      };
    default:
      return state;
  }
};
