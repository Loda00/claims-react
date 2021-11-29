import { combineReducers } from 'redux';
import { reducer as sectionCargarDocumentoReducer } from 'scenes/components/SectionCargarDocumento/reducer';

export const reducer = combineReducers({
  sectionCargarDocumento: sectionCargarDocumentoReducer
});
