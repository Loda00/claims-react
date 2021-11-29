import {
  FETCH_TASK_TYPES_SUCCEEDED,
  FETCH_TASK_TYPES_STARTED,
  FETCH_TASK_TYPES_FAILED
} from 'scenes/TaskTray/scenes/TaskTrayHome/data/taskTypes/actions';

const initialState = {
  taskTypes: [],
  isLoading: false,
  error: null
};

export const getTaskTypes = state => state.scenes.taskTray.taskTrayHome.data.taskTypes;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_TASK_TYPES_STARTED:
      return {
        ...state,
        isLoading: true
      };
    case FETCH_TASK_TYPES_SUCCEEDED:
      return {
        ...state,
        isLoading: false,
        taskTypes: action.payload.taskTypes
      };
    case FETCH_TASK_TYPES_FAILED:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    default:
      return state;
  }
};
