import { combineReducers } from 'redux';
import { reducer as dataReducer } from 'scenes/TaskTray/data/reducer';
import { reducer as taskTrayComponentsReducer } from 'scenes/TaskTray/components/reducer';
import { reducer as taskTrayHomeReducer } from 'scenes/TaskTray/scenes/TaskTrayHome/reducer';
import { reducer as completeTaskInfoReducer } from 'scenes/TaskTray/scenes/CompleteTaskInfo/reducer';

import { reducer as confirmarGestionReducer } from 'scenes/TaskTray/scenes/ConfirmarGestion/reducer';

export const reducer = combineReducers({
  taskTrayComponents: taskTrayComponentsReducer,
  taskTrayHome: taskTrayHomeReducer,
  completeTaskInfo: completeTaskInfoReducer,
  confirmarGestion: confirmarGestionReducer,
  data: dataReducer
});
