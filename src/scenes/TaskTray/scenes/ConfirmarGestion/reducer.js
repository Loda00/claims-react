import { combineReducers } from 'redux';
import { reducer as dataReducer } from 'scenes/TaskTray/scenes/ConfirmarGestion/data/reducer';

export const reducer = combineReducers({
  data: dataReducer
});
