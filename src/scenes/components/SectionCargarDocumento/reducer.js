import { combineReducers } from 'redux';
import { reducer as dataReducer } from 'scenes/components/SectionCargarDocumento/data/reducer';

export const reducer = combineReducers({
  data: dataReducer
});
