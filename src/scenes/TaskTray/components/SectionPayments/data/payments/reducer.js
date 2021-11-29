import {
  FETCH_PAYMENTS_STARTED,
  FETCH_PAYMENTS_SUCCEEDED,
  FETCH_PAYMENTS_FAILED,
  FETCH_PAYMENTS_RESET,
  MAINTAIN_PAYMENT_STARTED,
  MAINTAIN_PAYMENT_FINISHED,
  SEND_PAYMENT_STARTED,
  SEND_PAYMENT_FINISHED
} from 'scenes/TaskTray/components/SectionPayments/data/payments/actions';

const initialState = {
  payments: [],
  isLoading: false,
  error: null,
  isMaintainLoading: false,
  sendLoading: false,
  sendResult: {},
  activaBotonDevolverRevisar: false
};

export const getPayments = state => state.scenes.taskTray.taskTrayComponents.searchRegistry.data.payments.payments;
export const getPaymentStates = state =>
  state.scenes.taskTray.taskTrayComponents.searchRegistry.data.payments.payments.estados || [];
export const getPaymentsMaintainLoading = state =>
  state.scenes.taskTray.taskTrayComponents.searchRegistry.data.payments.isMaintainLoading;
export const getPaymentsSendLoading = state =>
  state.scenes.taskTray.taskTrayComponents.searchRegistry.data.payments.sendLoading;
export const getPaymentAdjuster = state =>
  state.scenes.taskTray.taskTrayComponents.searchRegistry.data.payments.sendLoading;
export const obtenerPagosHonorarios = state => {
  const pagos = state.scenes.taskTray.taskTrayComponents.searchRegistry.data.payments.payments || {};

  return pagos.honorarios || [];
};
export const obtenerPagosOtrosConceptos = state => {
  const pagos = state.scenes.taskTray.taskTrayComponents.searchRegistry.data.payments.payments || {};

  return pagos.otrosConceptos || [];
};

// export const getActivaBotonDevolverRevisar = state => {
//   const { } = state;
//   state.scenes.taskTray.taskTrayComponents.searchRegistry.data.payments.sendLoading
// };

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_PAYMENTS_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_PAYMENTS_SUCCEEDED:
      return {
        ...state,
        isLoading: false,
        payments: action.payload.payments
      };
    case FETCH_PAYMENTS_FAILED:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    case FETCH_PAYMENTS_RESET:
      return {
        ...state,
        isLoading: false,
        error: null,
        sendResult: {},
        payments: []
      };
    case MAINTAIN_PAYMENT_STARTED:
      return {
        ...state,
        isMaintainLoading: true
      };
    case MAINTAIN_PAYMENT_FINISHED:
      return {
        ...state,
        isMaintainLoading: false
      };
    case SEND_PAYMENT_STARTED:
      return {
        ...state,
        sendLoading: true
      };
    case SEND_PAYMENT_FINISHED:
      return {
        ...state,
        sendLoading: false,
        sendResult: action.payload.result
      };
    default:
      return state;
  }
};
