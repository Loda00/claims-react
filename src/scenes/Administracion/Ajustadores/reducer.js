import { combineReducers } from 'redux';
import { reducer as dataReducer } from 'scenes/Administracion/Ajustadores/data/reducer';

export const reducer = combineReducers({
  data: dataReducer
});
