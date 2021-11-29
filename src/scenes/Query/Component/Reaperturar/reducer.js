import { combineReducers } from 'redux';
import { reducer as dataReducer } from 'scenes/Query/Component/Reaperturar/data/reducer';

export const reducer = combineReducers({
  data: dataReducer
});
