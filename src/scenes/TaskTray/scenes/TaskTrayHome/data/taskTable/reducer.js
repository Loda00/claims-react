import {
  FETCH_TASK_TABLE_SUCCEEDED,
  FETCH_TASK_TABLE_STARTED,
  FETCH_TASK_TABLE_FAILED,
  FETCH_TASK_TABLE_RESET,
  UPDATE_FILTER,
  UPDATE_TAKEN_TASK,
  UPDATE_TASK_TABLE_META,
  UPDATE_TASK_TABLE_SORT_COLUMN
} from 'scenes/TaskTray/scenes/TaskTrayHome/data/taskTable/actions';

const initialState = {
  taskTable: [],
  filters: {},
  isLoading: false,
  error: null,
  sortColumn: 'tarea',
  meta: {
    page: 1,
    pageSize: 10,
    total: 0
  }
};

export const getCurrentTask = (state, { params }) => {
  return state.scenes.taskTray.taskTrayHome.data.taskTable.taskTable.find(
    task => task.numSiniestro === params.numSiniestro && Number(task.idCaso) === Number(params.idCaso)
  );
};

export const getCurrentTaskIdCase = (state, idCase) => {
  return state.scenes.taskTray.taskTrayHome.data.taskTable.taskTable.find(task => task.idCaso === idCase);
};

export const getFilters = state => {
  return state.scenes.taskTray.taskTrayHome.data.taskTable.filters;
};

export const getMetaPaginacion = state => {
  return state.scenes.taskTray.taskTrayHome.data.taskTable.meta;
};

export const getTaskTable = state => {
  return state.scenes.taskTray.taskTrayHome.data.taskTable;
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_TASK_TABLE_STARTED:
      return {
        ...state,
        error: null,
        isLoading: true
      };
    case FETCH_TASK_TABLE_RESET:
      return {
        ...initialState
      };
    case FETCH_TASK_TABLE_SUCCEEDED:
      return {
        ...state,
        isLoading: false,
        taskTable: action.data,
        meta: {
          ...state.meta,
          ...action.meta
        }
      };
    case UPDATE_TASK_TABLE_META:
      return {
        ...state,
        meta: {
          ...state.meta,
          ...action.meta
        }
      };
    case UPDATE_TASK_TABLE_SORT_COLUMN:
      return {
        ...state,
        sortColumn: action.sortColumn
      };
    case FETCH_TASK_TABLE_FAILED:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    case UPDATE_FILTER:
      return {
        ...state,
        filters: action.payload
      };
    case UPDATE_TAKEN_TASK:
      return {
        ...state,
        taskTable: state.taskTable.map(task => {
          if (task.numSiniestro === action.payload) {
            return {
              ...task,
              tomado: true
            };
          }

          return task;
        })
      };
    default:
      return state;
  }
};
