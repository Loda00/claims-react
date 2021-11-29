import {
  FETCH_DOCUMENT_STARTED,
  FETCH_DOCUMENT_FINISHED,
  FETCH_DOCUMENT_RESET
} from 'scenes/TaskTray/components/SectionDocumentSinister/data/documents/action';

const initialState = {
  documents: [],
  isLoading: false
};

export const getDocuments = state => state.scenes.taskTray.taskTrayComponents.sectionDocumentSinister.data.documents;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_DOCUMENT_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_DOCUMENT_FINISHED:
      return {
        ...state,
        isLoading: false,
        documents: action.payload.documents
      };
    case FETCH_DOCUMENT_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
