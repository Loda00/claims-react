import {
  FETCH_CAUSES_STARTED,
  FETCH_CAUSES_SUCCEEDED,
  FETCH_CAUSES_FAILED,
  FETCH_CAUSES_RESET
} from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DatosCobertura/data/causes/actions';

const initialState = {
  causes: [],
  isLoading: false,
  error: null
};

export const getCauses = state => state.scenes.taskTray.completeTaskInfo.components.datosCobertura.data.causes;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_CAUSES_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_CAUSES_RESET:
      return {
        ...initialState
      };
    case FETCH_CAUSES_SUCCEEDED:
      return {
        ...state,
        isLoading: false,
        causes: action.payload.causes
      };
    case FETCH_CAUSES_FAILED:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    default:
      return state;
  }
};
