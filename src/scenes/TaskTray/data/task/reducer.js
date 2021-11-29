import {
  TAKE_TASK_SUCCEEDED,
  TAKE_TASK_STARTED,
  TAKE_TASK_FAILED,
  GUARDAR_SINIESTRO_COMENZADO,
  GUARDAR_SINIESTRO_FINALIZADO,
  GUARDAR_SINIESTRO_REINICIADO
} from 'scenes/TaskTray/data/task/actions';

const initialState = {
  isLoading: false,
  error: null
};

export const getTakeTask = state => state.scenes.taskTray.data.task;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case TAKE_TASK_STARTED:
      return {
        ...state,
        error: null,
        isLoading: true
      };
    case TAKE_TASK_SUCCEEDED:
      return {
        ...state,
        isLoading: false
      };
    case TAKE_TASK_FAILED:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    case GUARDAR_SINIESTRO_COMENZADO:
      return {
        ...initialState,
        isLoading: true
      };
    case GUARDAR_SINIESTRO_FINALIZADO:
      return {
        ...state,
        isLoading: false
      };
    case GUARDAR_SINIESTRO_REINICIADO:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
