import { combineReducers } from 'redux';

import { reducer as dataReducer } from 'scenes/TaskTray/components/SectionHistoryChange/data/reducer';

export const reducer = combineReducers({
  data: dataReducer
});
