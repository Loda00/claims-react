import { combineReducers } from 'redux';

import { reducer as dataReducer } from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/SearchPoliza/data/reducer';

export const reducer = combineReducers({
  data: dataReducer
});
