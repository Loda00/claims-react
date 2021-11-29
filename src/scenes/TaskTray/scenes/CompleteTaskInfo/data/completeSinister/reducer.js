import {
  COMPLETE_SINISTER_SUCCEEDED,
  COMPLETE_SINISTER_FAILED
} from 'scenes/TaskTray/scenes/CompleteTaskInfo/data/completeSinister/actions';

const initialState = {
  error: null
};

export const getCompleteSinister = state => state.scenes.taskTray.completeTaskInfo.data.completeSinister;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case COMPLETE_SINISTER_SUCCEEDED:
      return {
        ...state,
        error: null
      };
    case COMPLETE_SINISTER_FAILED:
      return {
        ...state,
        error: action.payload
      };
    default:
      return state;
  }
};
