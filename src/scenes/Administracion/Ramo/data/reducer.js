import { combineReducers } from 'redux';
import { reducer as mantenerRamoReducer } from 'scenes/Administracion/Ramo/data/mantenerRamo/reducer';

export const reducer = combineReducers({
  mantenerRamo: mantenerRamoReducer
});
