import { FETCH_PRODUCTS_SUCCEEDED, FETCH_PRODUCTS_STARTED, FETCH_PRODUCTS_FAILED } from 'scenes/data/productos/action';

const initialState = {
  producto: [],
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
        producto: action.payload.producto
      };
    case FETCH_PRODUCTS_FAILED:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    default:
      return state;
  }
};
