import { reducer as sendCargaMasivaReducer } from 'scenes/CargaMasiva/data/reducer';
import { combineReducers } from 'redux';

export const reducer = combineReducers({
  dataCargaMasiva: sendCargaMasivaReducer
});
