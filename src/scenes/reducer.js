import { combineReducers } from 'redux';
import { reducer as taskTrayReducer } from 'scenes/TaskTray/reducer';
import { reducer as queryReducer } from 'scenes/Query/reducer';
import { reducer as cargaMasivaReducer } from 'scenes/CargaMasiva/reducer';
import { reducer as administracionReducer } from 'scenes/Administracion/reducer';
import { reducer as dataReducer } from 'scenes/data/reducer';
import { reducer as componentsReducer } from 'scenes/components/reducer';

export const reducer = combineReducers({
  taskTray: taskTrayReducer,
  query: queryReducer,
  cargaMasiva: cargaMasivaReducer,
  administracion: administracionReducer,
  data: dataReducer,
  components: componentsReducer
});
