import { combineReducers } from 'redux';

import { reducer as dataReducer } from 'scenes/TaskTray/components/SectionBitacora/data/reducer';

export const reducer = combineReducers({
  data: dataReducer
});
