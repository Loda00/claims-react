import {
  FETCH_SEARCH_SINISTER_STARTED,
  FETCH_SEARCH_SINISTER_SUCCEEDED,
  FETCH_SEARCH_SINISTER_FAILED,
  FETCH_SEARCH_SINISTER_RESET,
  UPDATE_SEARCH_SINISTER_META,
  FETCH_EXPORT_SEARCH_SINISTER_STARTED,
  FETCH_EXPORT_SEARCH_SINISTER_SUCCEEDED,
  FETCH_EXPORT_SINISTER_FAILED,
  UPDATE_FILTER,
  UPDATE_TASK_TABLE_SORT_COLUMN
} from 'scenes/Query/data/searchSinister/action';

const initialState = {
  searchSinister: [],
  exportSinister: [],
  isLoading: false,
  loadingExportSinister: false,
  error: null,
  sortColumn: 'tarea',
  meta: {
    page: 1,
    pageSize: 10,
    total: 0
  },
  existingSearchSinister: {}
};

export const getSearchSinister = state => state.scenes.query.data.searchSinister;
export const getExportSinister = state => state.scenes.query.data.searchSinister;

export const getFilters = state => {
  return state.scenes.query.data.searchSinister.filters;
};

export const getMetaPaginacion = state => {
  return state.scenes.query.data.searchSinister.meta;
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_EXPORT_SEARCH_SINISTER_STARTED:
      return {
        ...state,
        loadingExportSinister: true
      };
    case FETCH_EXPORT_SEARCH_SINISTER_SUCCEEDED:
      return {
        ...state,
        loadingExportSinister: false,
        exportSinister: action.data,
        meta: {
          ...state.meta,
          ...action.meta
        }
      };
    case FETCH_EXPORT_SINISTER_FAILED:
      return {
        ...state,
        loadingExportSinister: false,
        error: action.payload
      };
    case FETCH_SEARCH_SINISTER_STARTED:
      return {
        ...state,
        isLoading: true
      };
    case FETCH_SEARCH_SINISTER_SUCCEEDED:
      return {
        ...state,
        isLoading: false,
        searchSinister: action.data,
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
    case FETCH_SEARCH_SINISTER_RESET:
      return {
        ...state,
        searchSinister: [],
        isLoading: false,
        error: null,
        meta: {
          page: 0,
          pageSize: 10,
          total: 0
        }
      };
    case UPDATE_SEARCH_SINISTER_META:
      return {
        ...state,
        meta: {
          ...state.meta,
          ...action.meta
        }
      };

    case FETCH_SEARCH_SINISTER_FAILED:
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
    default:
      return state;
  }
};
