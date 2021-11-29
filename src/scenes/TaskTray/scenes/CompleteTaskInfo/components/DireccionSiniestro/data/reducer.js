import { combineReducers } from 'redux';
import { reducer as addressesReducer } from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DireccionSiniestro/data/addresses/reducer';
import { reducer as locationsReducer } from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DireccionSiniestro/data/locations/reducer';

export const reducer = combineReducers({
  addresses: addressesReducer,
  locations: locationsReducer
});
