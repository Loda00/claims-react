import {
  FETCH_PAYMENT_TYPES_STARTED,
  FETCH_PAYMENT_TYPES_SUCCEEDED,
  FETCH_PAYMENT_TYPES_FAILED,
  FETCH_PAYMENT_TYPES_RESET
} from 'scenes/TaskTray/components/SectionPayments/data/paymentTypes/actions';

const initialState = {
  paymentTypes: [],
  isLoading: false,
  error: null
};

export const getPaymentTypes = state => state.scenes.taskTray.taskTrayComponents.searchRegistry.data.paymentTypes;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_PAYMENT_TYPES_STARTED:
      return {
        ...state,
        isLoading: true
      };
    case FETCH_PAYMENT_TYPES_SUCCEEDED:
      return {
        ...state,
        isLoading: false,
        paymentTypes: action.payload.paymentTypes
      };
    case FETCH_PAYMENT_TYPES_FAILED:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    case FETCH_PAYMENT_TYPES_RESET:
      return {
        ...state,
        isLoading: false,
        error: null,
        paymentTypes: []
      };
    default:
      return state;
  }
};
