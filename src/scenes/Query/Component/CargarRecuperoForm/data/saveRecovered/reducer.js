import {
  FETCH_SAVE_RECOVERED_STARTED,
  FETCH_SAVE_RECOVERED_FINISHED,
  FETCH_SAVE_RECOVERED_RESET
} from 'scenes/Query/Component/CargarRecuperoForm/data/saveRecovered/action';

const initialState = {
  saveRecovered: [],
  isLoading: false
};

export const getSaveRecovered = state => state.scenes.query.component.cargarRecupero.data.saveRecovered;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_SAVE_RECOVERED_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_SAVE_RECOVERED_FINISHED:
      return {
        ...state,
        isLoading: false,
        saveRecovered: action.payload.saveRecovered
      };
    case FETCH_SAVE_RECOVERED_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
