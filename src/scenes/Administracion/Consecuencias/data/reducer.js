import { combineReducers } from 'redux';
import { reducer as mantenerConsecuenciaReducer } from 'scenes/Administracion/Consecuencias/data/mantenerConsecuencia/reducer';

export const reducer = combineReducers({
  mantenerConsecuencia: mantenerConsecuenciaReducer
});
