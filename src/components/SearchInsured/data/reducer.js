import { combineReducers } from 'redux';
import { reducer as documentTypesReducer } from 'components/SearchInsured/data/documentTypes/reducer';
import { reducer as insuredReducer } from 'components/SearchInsured/data/thirdparty/reducer';

export const reducer = combineReducers({
  documentTypes: documentTypesReducer,
  thirdparty: insuredReducer
});
