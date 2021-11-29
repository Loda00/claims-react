import { combineReducers } from 'redux';
import { reducer as teamsReducer } from 'scenes/data/teams/reducer';
import { reducer as documentoReducer } from 'scenes/data/documento/reducer';
import { reducer as productosReducer } from 'scenes/data/productos/reducer';

export const reducer = combineReducers({
  teams: teamsReducer,
  documento: documentoReducer,
  producto: productosReducer
});
