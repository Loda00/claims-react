import {
  FETCH_POLIZA_LIDER_STARTED,
  FETCH_POLIZA_LIDER_SUCCEEDED,
  FETCH_POLIZA_LIDER_FAILED,
  FETCH_POLIZA_LIDER_RESET
} from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/SearchPoliza/data/bscPolizaLider/actions';

const initialState = {
  polizaLider: [],
  isLoading: false,
  error: null,
  sortColumn: undefined,
  meta: {
    page: 1,
    pageSize: 10,
    total: 0
  }
};

export const getPolizaLider = state => state.scenes.taskTray.completeTaskInfo.components.searchPoliza.data.polizaLider;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_POLIZA_LIDER_STARTED:
      return {
        ...state,
        isLoading: true
      };
    case FETCH_POLIZA_LIDER_RESET:
      return {
        ...state,
        polizaLider: [],
        isLoading: false,
        sortColumn: undefined,
        error: null,
        meta: {
          page: 1,
          pageSize: 10,
          total: 0
        }
      };
    case FETCH_POLIZA_LIDER_SUCCEEDED:
      return {
        ...state,
        isLoading: false,
        polizaLider: action.data,
        meta: {
          ...state.meta,
          ...action.meta
        }
      };
    case FETCH_POLIZA_LIDER_FAILED:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    default:
      return state;
  }
};
