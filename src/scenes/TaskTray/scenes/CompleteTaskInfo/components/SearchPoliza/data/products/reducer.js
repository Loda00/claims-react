import {
  FETCH_PRODUCTS_SUCCEEDED,
  FETCH_PRODUCTS_STARTED,
  FETCH_PRODUCTS_FAILED,
  FETCH_PRODUCTS_RESET
} from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/SearchPoliza/data/products/actions';

const initialState = {
  products: [],
  isLoading: false,
  error: null
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_PRODUCTS_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_PRODUCTS_SUCCEEDED:
      return {
        ...state,
        isLoading: false,
        products: action.payload.products
      };
    case FETCH_PRODUCTS_FAILED:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    case FETCH_PRODUCTS_RESET:
      return {
        ...state,
        isLoading: false,
        error: null,
        products: []
      };
    default:
      return state;
  }
};
