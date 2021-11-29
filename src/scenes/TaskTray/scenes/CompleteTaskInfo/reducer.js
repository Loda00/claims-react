import { combineReducers } from 'redux';

import { reducer as dataReducer } from 'scenes/TaskTray/scenes/CompleteTaskInfo/data/reducer';
import { reducer as componentsReducer } from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/reducer';
import { reducer as duplicados } from 'scenes/TaskTray/scenes/SiniestroDuplicado/data/reducer';

export const reducer = combineReducers({
  data: dataReducer,
  components: componentsReducer,
  duplicados
});
