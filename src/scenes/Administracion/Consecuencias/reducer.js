import { combineReducers } from 'redux';
import { reducer as dataReducer } from 'scenes/Administracion/Consecuencias/data/reducer';

export const reducer = combineReducers({
  data: dataReducer
});
