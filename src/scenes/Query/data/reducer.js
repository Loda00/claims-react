import { combineReducers } from 'redux';
import { reducer as searchSinisterReducer } from 'scenes/Query/data/searchSinister/reducer';
import { reducer as stateSinisterReducer } from 'scenes/Query/data/stateSinister/reducer';
import { reducer as teamsReducer } from 'scenes/data/teams/reducer';

export const reducer = combineReducers({
  searchSinister: searchSinisterReducer,
  stateSinister: stateSinisterReducer,
  teams: teamsReducer
});
