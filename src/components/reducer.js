import { combineReducers } from 'redux';
import { reducer as searchInsuredReducer } from 'components/SearchInsured/reducer';
import { reducer as priceInputReducer } from 'components/PriceInput/reducer';

export const reducer = combineReducers({
  searchInsured: searchInsuredReducer,
  priceInput: priceInputReducer
});
