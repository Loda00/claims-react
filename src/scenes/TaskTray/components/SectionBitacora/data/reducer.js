import { combineReducers } from 'redux';

import { reducer as bitacoraReducer } from 'scenes/TaskTray/components/SectionBitacora/data/bitacora/reducer';

export const reducer = combineReducers({
  bitacora: bitacoraReducer
});
