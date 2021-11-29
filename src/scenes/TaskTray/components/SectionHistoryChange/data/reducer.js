import { combineReducers } from 'redux';

import { reducer as historialReservaReducer } from 'scenes/TaskTray/components/SectionHistoryChange/data/historialReserva/reducer';

export const reducer = combineReducers({
  historialReserva: historialReservaReducer
});
