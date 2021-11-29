import {
  FETCH_POLICIES_STARTED,
  FETCH_POLICIES_SUCCEEDED,
  FETCH_POLICIES_FAILED,
  UPDATE_POLICIES_META,
  FETCH_POLICIES_RESET,
  FETCH_EXISTING_POLICY_STARTED,
  FETCH_EXISTING_POLICY_SUCCEEDED,
  UPDATE_POLICIES_SORT_COLUMN
} from 'scenes/TaskTray/scenes/SiniestroDuplicado/data/poliza/actions';

const initialState = {
  poliza: [],
  isLoading: false,
  error: null,
  sortColumn: undefined,
  meta: {
    page: 1,
    pageSize: 10,
    total: 0
  },
  polizaExistente: {},
  loadingExistingPolicy: false
};

export const getPolizaDuplicada = state =>
  state.scenes.taskTray.completeTaskInfo.duplicados.consultarPolizaDuplicada.poliza;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_POLICIES_STARTED:
      return {
        ...state,
        isLoading: true
      };
    case FETCH_POLICIES_RESET:
      return {
        ...state,
        poliza: [],
        isLoading: false,
        loadingExistingPolicy: false,
        sortColumn: undefined,
        polizaExistente: {},
        error: null,
        meta: {
          page: 1,
          pageSize: 10,
          total: 0
        }
      };
    case FETCH_POLICIES_SUCCEEDED:
      return {
        ...state,
        isLoading: false,
        loadingExistingPolicy: false,
        poliza: action.data,
        meta: {
          ...state.meta,
          ...action.meta
        }
      };
    case UPDATE_POLICIES_META:
      return {
        ...state,
        meta: {
          ...state.meta,
          ...action.meta
        }
      };
    case UPDATE_POLICIES_SORT_COLUMN:
      return {
        ...state,
        sortColumn: action.sortColumn
      };
    case FETCH_POLICIES_FAILED:
      return {
        ...state,
        isLoading: false,
        loadingExistingPolicy: false,
        error: action.payload
      };
    case FETCH_EXISTING_POLICY_STARTED:
      return {
        ...state,
        loadingExistingPolicy: true
      };
    case FETCH_EXISTING_POLICY_SUCCEEDED:
      return {
        ...state,
        loadingExistingPolicy: false,
        polizaExistente: action.data
      };
    default:
      return state;
  }
};
