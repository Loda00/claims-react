import { combineReducers } from 'redux';
import { reducer as dataReducer } from 'scenes/TaskTray/components/SectionDocumentSinister/data/reducer';

export const reducer = combineReducers({
  data: dataReducer
});
