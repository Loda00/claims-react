import { combineReducers } from 'redux';
import { reducer as dataReducer } from 'scenes/Query/data/reducer';
import { reducer as componentReducer } from 'scenes/Query/Component/reducer';

export const reducer = combineReducers({
  data: dataReducer,
  component: componentReducer
});
