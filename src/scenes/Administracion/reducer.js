import { combineReducers } from 'redux';
import { reducer as dataReducer } from 'scenes/Administracion/data/reducer';
import { reducer as ramoReducer } from 'scenes/Administracion/Ramo/reducer';
import { reducer as causaReducer } from 'scenes/Administracion/Causas/reducer';
import { reducer as consecuenciaReducer } from 'scenes/Administracion/Consecuencias/reducer';
import { reducer as ajustadorReducer } from 'scenes/Administracion/Ajustadores/reducer';

export const reducer = combineReducers({
  data: dataReducer,
  ramo: ramoReducer,
  causa: causaReducer,
  consecuencia: consecuenciaReducer,
  ajustador: ajustadorReducer
});
