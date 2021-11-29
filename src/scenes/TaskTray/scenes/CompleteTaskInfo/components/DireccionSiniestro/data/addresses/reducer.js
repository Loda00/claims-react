import {
  FETCH_ADDRESSES_STARTED,
  FETCH_ADDRESSES_SUCCEEDED,
  FETCH_ADDRESSES_FAILED,
  FETCH_ADDRESSES_RESET,
  UPDATE_SEARCH_TERM
} from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DireccionSiniestro/data/addresses/actions';

const initialState = {
  addresses: [],
  isLoading: false,
  error: null,
  searchTerm: ''
};

export const getAddresses = state => {
  const addressObject = state.scenes.taskTray.completeTaskInfo.components.direccionSiniestro.data.addresses;
  const searchTerm = addressObject.searchTerm;
  const addressesMap = addressObject.addresses;
  const isLoading = addressObject.isLoading;
  const error = addressObject.error;

  const addresses = addressesMap.filter(
    address => address.direc && address.direc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    addresses,
    isLoading,
    error
  };
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ADDRESSES_STARTED:
      return {
        ...initialState,
        error: null,
        isLoading: true
      };
    case FETCH_ADDRESSES_RESET:
      return {
        ...initialState
      };
    case FETCH_ADDRESSES_SUCCEEDED:
      return {
        ...state,
        isLoading: false,
        addresses: action.payload.addresses
      };
    case FETCH_ADDRESSES_FAILED:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    case UPDATE_SEARCH_TERM:
      return {
        ...state,
        searchTerm: action.payload
      };
    default:
      return state;
  }
};
