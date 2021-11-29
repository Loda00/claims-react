import { combineReducers } from 'redux';
import { reducer as listRecoveredReducer } from 'scenes/Query/Component/CargarRecuperoForm/data/listRecovered/reducer';
import { reducer as saveRecoveredReducer } from 'scenes/Query/Component/CargarRecuperoForm/data/saveRecovered/reducer';

export const reducer = combineReducers({
  listRecovered: listRecoveredReducer,
  saveRecovered: saveRecoveredReducer
});
