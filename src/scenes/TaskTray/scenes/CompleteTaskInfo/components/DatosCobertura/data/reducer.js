import { combineReducers } from 'redux';
import { reducer as branchesReducer } from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DatosCobertura/data/branches/reducer';
import { reducer as causesReducer } from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DatosCobertura/data/causes/reducer';
import { reducer as consequencesReducer } from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DatosCobertura/data/consequences/reducer';

export const reducer = combineReducers({
  branches: branchesReducer,
  causes: causesReducer,
  consequences: consequencesReducer
});
