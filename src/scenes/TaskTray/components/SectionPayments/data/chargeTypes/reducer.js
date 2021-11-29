import {
  FETCH_CHARGE_TYPES_STARTED,
  FETCH_CHARGE_TYPES_SUCCEEDED,
  FETCH_CHARGE_TYPES_FAILED,
  FETCH_CHARGE_TYPES_RESET
} from 'scenes/TaskTray/components/SectionPayments/data/chargeTypes/actions';

const initialState = {
  chargeTypes: [],
  isLoading: false,
  error: null
};

export const getChargeTypes = state => state.scenes.taskTray.taskTrayComponents.searchRegistry.data.chargeTypes;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_CHARGE_TYPES_STARTED:
      return {
        ...state,
        isLoading: true
      };
    case FETCH_CHARGE_TYPES_SUCCEEDED:
      return {
        ...state,
        isLoading: false,
        chargeTypes: action.payload.chargeTypes
      };
    case FETCH_CHARGE_TYPES_FAILED:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    case FETCH_CHARGE_TYPES_RESET:
      return {
        ...state,
        isLoading: false,
        error: null,
        chargeTypes: []
      };
    default:
      return state;
  }
};
