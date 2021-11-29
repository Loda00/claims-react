import { combineReducers } from 'redux';
import tipoTaskReducer from 'scenes/TaskTray/scenes/ConfirmarGestion/data/tipoTarea/reducer';

export const reducer = combineReducers({
  tipoTask: tipoTaskReducer
});
