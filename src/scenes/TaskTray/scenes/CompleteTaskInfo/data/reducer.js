import { combineReducers } from 'redux';
import { reducer as adjustersReducer } from 'scenes/TaskTray/scenes/CompleteTaskInfo/data/adjusters/reducer';
import { reducer as completeSinisterReducer } from 'scenes/TaskTray/scenes/CompleteTaskInfo/data/completeSinister/reducer';
import { reducer as lossTypesReducer } from 'scenes/TaskTray/scenes/CompleteTaskInfo/data/lossTypes/reducer';
import { reducer as meansOfTransportReducer } from 'scenes/TaskTray/scenes/CompleteTaskInfo/data/meansOfTransport/reducer';
import { reducer as eventTypesReducer } from 'scenes/TaskTray/scenes/CompleteTaskInfo/data/eventTypes/reducer';

export const reducer = combineReducers({
  eventTypes: eventTypesReducer,
  completeSinister: completeSinisterReducer,
  lossTypes: lossTypesReducer,
  meansOfTransport: meansOfTransportReducer,
  adjusters: adjustersReducer
});
