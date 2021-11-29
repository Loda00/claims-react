import {
  FETCH_COIN_TYPES_STARTED,
  FETCH_COIN_TYPES_SUCCEEDED,
  FETCH_COIN_TYPES_FAILED,
  FETCH_COIN_TYPES_RESET
} from 'scenes/TaskTray/components/SectionPayments/data/coinTypes/actions';

const initialState = {
  coinTypes: [],
  isLoading: false,
  error: null
};

export const getCoinTypes = state => state.scenes.taskTray.taskTrayComponents.searchRegistry.data.coinTypes;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_COIN_TYPES_STARTED:
      return {
        ...state,
        isLoading: true
      };
    case FETCH_COIN_TYPES_SUCCEEDED:
      return {
        ...state,
        isLoading: false,
        coinTypes: action.payload.coinTypes
      };
    case FETCH_COIN_TYPES_FAILED:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    case FETCH_COIN_TYPES_RESET:
      return {
        ...state,
        isLoading: false,
        error: null,
        coinTypes: []
      };
    default:
      return state;
  }
};
