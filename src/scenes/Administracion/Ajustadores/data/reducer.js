import { combineReducers } from 'redux';
import { reducer as mantenerAjustadorReducer } from 'scenes/Administracion/Ajustadores/data/mantenerAjustador/reducer';

export const reducer = combineReducers({
  mantenerAjustador: mantenerAjustadorReducer
});
