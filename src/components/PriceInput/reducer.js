import { combineReducers } from 'redux';
import { reducer as dataReducer } from 'components/PriceInput/data/reducer';

export const reducer = combineReducers({
  data: dataReducer
});
