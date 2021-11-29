import {
  FETCH_CONSEQUENCES_STARTED,
  FETCH_CONSEQUENCES_SUCCEEDED,
  FETCH_CONSEQUENCES_FAILED,
  FETCH_CONSEQUENCES_RESET
} from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DatosCobertura/data/consequences/actions';

const initialState = {
  consequences: [],
  isLoading: false,
  error: null
};

export const getConsequences = state =>
  state.scenes.taskTray.completeTaskInfo.components.datosCobertura.data.consequences;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_CONSEQUENCES_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_CONSEQUENCES_RESET:
      return {
        ...initialState
      };
    case FETCH_CONSEQUENCES_SUCCEEDED:
      return {
        ...state,
        isLoading: false,
        consequences: action.payload.consequences
      };
    case FETCH_CONSEQUENCES_FAILED:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    default:
      return state;
  }
};
