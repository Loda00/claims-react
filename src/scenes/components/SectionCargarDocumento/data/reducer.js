import { combineReducers } from 'redux';
import { reducer as typeDocumentReducer } from 'scenes/components/SectionCargarDocumento/data/typeDocument/reducer';
import { reducer as subTypeDocumentReducer } from 'scenes/components/SectionCargarDocumento/data/subTypeDocument/reducer';

export const reducer = combineReducers({
  typeDocument: typeDocumentReducer,
  subTypeDocument: subTypeDocumentReducer
});
