import { combineReducers } from 'redux';
import { reducer as dataReducer } from 'scenes/Administracion/Ramo/data/reducer';

export const reducer = combineReducers({
  data: dataReducer
});
