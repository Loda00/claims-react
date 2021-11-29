import { combineReducers } from 'redux';
import { reducer as taskTypesReducer } from 'scenes/TaskTray/scenes/TaskTrayHome/data/taskTypes/reducer';
import { reducer as taskTableReducer } from 'scenes/TaskTray/scenes/TaskTrayHome/data/taskTable/reducer';

export const reducer = combineReducers({
  taskTypes: taskTypesReducer,
  taskTable: taskTableReducer
});
