import {
  FETCH_CERTIFICATES_STARTED,
  FETCH_CERTIFICATES_SUCCEEDED,
  FETCH_CERTIFICATES_FAILED,
  UPDATE_CERTIFICATES_META,
  FETCH_CERTIFICATES_RESET,
  FETCH_EXISTING_CERTIFICATE_STARTED,
  FETCH_EXISTING_CERTIFICATE_SUCCEEDED,
  UPDATE_CERTIFICATES_SORT_COLUMN
} from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/SearchCertificado/data/certificates/actions';

const initialState = {
  certificates: [],
  isLoading: false,
  error: null,
  sortColumn: undefined,
  meta: {
    page: 1,
    pageSize: 10,
    total: 0
  },
  existingCertificate: {},
  loadingExistingCertificate: false
};

export const getCertificates = state =>
  state.scenes.taskTray.completeTaskInfo.components.searchCertificado.data.certificates;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_CERTIFICATES_STARTED:
      return {
        ...state,
        error: null,
        isLoading: true
      };
    case FETCH_EXISTING_CERTIFICATE_STARTED:
      return {
        ...state,
        loadingExistingCertificate: true
      };
    case FETCH_CERTIFICATES_SUCCEEDED:
      return {
        ...state,
        isLoading: false,
        loadingExistingCertificate: false,
        certificates: action.data,
        meta: {
          ...state.meta,
          ...action.meta
        }
      };
    case FETCH_EXISTING_CERTIFICATE_SUCCEEDED:
      return {
        ...state,
        loadingExistingCertificate: false,
        existingCertificate: action.data
      };
    case UPDATE_CERTIFICATES_META:
      return {
        ...state,
        meta: {
          ...state.meta,
          ...action.meta
        }
      };
    case UPDATE_CERTIFICATES_SORT_COLUMN:
      return {
        ...state,
        sortColumn: action.sortColumn
      };
    case FETCH_CERTIFICATES_RESET:
      return {
        ...state,
        certificates: [],
        isLoading: false,
        loadingExistingCertificate: false,
        existingCertificate: {},
        sortColumn: undefined,
        error: null,
        meta: {
          page: 1,
          pageSize: 10,
          total: 0
        }
      };
    case FETCH_CERTIFICATES_FAILED:
      return {
        ...state,
        isLoading: false,
        loadingExistingCertificate: false,
        error: action.payload
      };
    default:
      return state;
  }
};
