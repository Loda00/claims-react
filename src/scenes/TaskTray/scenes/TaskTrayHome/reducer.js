import { combineReducers } from 'redux';

import { reducer as dataReducer } from 'scenes/TaskTray/scenes/TaskTrayHome/data/reducer';

export const reducer = combineReducers({
  data: dataReducer
});
