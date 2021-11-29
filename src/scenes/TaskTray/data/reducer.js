import { combineReducers } from 'redux';
import { reducer as taskReducer } from 'scenes/TaskTray/data/task/reducer';
import { reducer as conceptsReducer } from 'scenes/TaskTray/data/concepts/reducer';

export const reducer = combineReducers({
  task: taskReducer,
  concepts: conceptsReducer
});
