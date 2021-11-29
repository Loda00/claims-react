import { combineReducers } from 'redux';
import { reducer as currenciesReducer } from 'components/PriceInput/data/currencies/reducer';

export const reducer = combineReducers({
  currencies: currenciesReducer
});
