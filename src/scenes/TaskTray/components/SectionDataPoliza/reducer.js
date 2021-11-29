import { combineReducers } from 'redux';

import { reducer as dataPolizaReducer } from 'scenes/TaskTray/components/SectionDataPoliza/data/reducer';

export const reducer = combineReducers({
  data: dataPolizaReducer
});
