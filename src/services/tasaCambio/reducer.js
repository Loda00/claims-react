import { FETCH_TASACAMBIO_STARTED, FETCH_TASACAMBIO_FINISHED } from 'services/tasaCambio/actions';

const initialState = {
  tasaCambio: {},
  isLoading: false
};

export const getTasaCambio = state => state.services.tasaCambio.tasaCambio;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_TASACAMBIO_STARTED:
      return {
        ...state,
        isLoading: true
      };
    case FETCH_TASACAMBIO_FINISHED:
      return {
        ...state,
        isLoading: false,
        tasaCambio: {
          ...state.tasaCambio,
          [action.payload.key]: action.payload.tasaCambio
        }
      };
    default:
      return state;
  }
};
