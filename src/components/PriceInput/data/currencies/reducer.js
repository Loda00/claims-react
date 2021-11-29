import {
  FETCH_CURRENCIES_STARTED,
  FETCH_CURRENCIES_FAILED,
  FETCH_CURRENCIES_SUCCEEDED
} from 'components/PriceInput/data/currencies/actions';

const initialState = {
  currencies: [],
  isLoading: false,
  error: null
};

export const getCurrencies = state => state.components.priceInput.data.currencies;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_CURRENCIES_STARTED:
      return {
        ...state,
        isLoading: true
      };
    case FETCH_CURRENCIES_SUCCEEDED:
      return {
        ...state,
        isLoading: false,
        currencies: action.payload.currencies
      };
    case FETCH_CURRENCIES_FAILED:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    default:
      return state;
  }
};
