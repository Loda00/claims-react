import {
  FETCH_LOSS_TYPES_STARTED,
  FETCH_LOSS_TYPES_FAILED,
  FETCH_LOSS_TYPES_RESET,
  FETCH_LOSS_TYPES_SUCCEEDED,
  UPDATE_SELECTED_LOSSTYPE
} from 'scenes/TaskTray/scenes/CompleteTaskInfo/data/lossTypes/actions';

const initialState = {
  selectedLossType: '',
  lossTypes: [],
  isLoading: false,
  error: null
};

export const getLossTypes = state => state.scenes.taskTray.completeTaskInfo.data.lossTypes;

export const getLossDetails = state => {
  const lossTypes = state.scenes.taskTray.completeTaskInfo.data.lossTypes.lossTypes;
  const selectedLossType = state.scenes.taskTray.completeTaskInfo.data.lossTypes.selectedLossType;
  const currentLossType =
    lossTypes.find(lossType => {
      return lossType.valor === selectedLossType;
    }) || {};

  return currentLossType.list;
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_LOSS_TYPES_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_LOSS_TYPES_RESET:
      return {
        ...initialState
      };
    case FETCH_LOSS_TYPES_SUCCEEDED:
      return {
        ...state,
        isLoading: false,
        lossTypes: action.payload.lossTypes
      };
    case FETCH_LOSS_TYPES_FAILED:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    case UPDATE_SELECTED_LOSSTYPE:
      return {
        ...state,
        selectedLossType: action.payload.selectedLossType
      };
    default:
      return state;
  }
};
