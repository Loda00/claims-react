import { combineReducers } from 'redux';

import { reducer as dataReducer } from 'scenes/TaskTray/components/SectionDataCobertura/data/reducer';

export const reducer = combineReducers({
  data: dataReducer
});
