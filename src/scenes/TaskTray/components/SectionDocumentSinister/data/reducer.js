import { combineReducers } from 'redux';
import { reducer as documentsReducer } from 'scenes/TaskTray/components/SectionDocumentSinister/data/documents/reducer';

export const reducer = combineReducers({
  documents: documentsReducer
});
