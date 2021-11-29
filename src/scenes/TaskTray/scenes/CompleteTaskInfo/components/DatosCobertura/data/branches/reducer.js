import {
  UPDATE_SELECTED_BRANCH,
  FETCH_BRANCHES_STARTED,
  FETCH_BRANCHES_SUCCEEDED,
  FETCH_BRANCHES_FAILED,
  FETCH_BRANCHES_RESET
} from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DatosCobertura/data/branches/actions';

const initialState = {
  selectedBranch: '',
  branches: [],
  isLoading: false,
  error: null
};

export const getBranches = state => state.scenes.taskTray.completeTaskInfo.components.datosCobertura.data.branches;
export const getErrorBranches = state =>
  state.scenes.taskTray.completeTaskInfo.components.datosCobertura.data.branches.error;

export const getCoverages = state => {
  const branches = state.scenes.taskTray.completeTaskInfo.components.datosCobertura.data.branches.branches;
  const selectedBranch = state.scenes.taskTray.completeTaskInfo.components.datosCobertura.data.branches.selectedBranch;
  const currentBranch =
    branches.find(branch => {
      return branch.codRamo === selectedBranch;
    }) || {};

  return currentBranch.listCoberturas;
};

export const getRamosCoberturas = state =>
  state.scenes.taskTray.completeTaskInfo.components.datosCobertura.data.branches.branches;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_BRANCHES_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_BRANCHES_RESET:
      return {
        ...initialState
      };
    case FETCH_BRANCHES_SUCCEEDED:
      return {
        ...state,
        isLoading: false,
        branches: action.payload.branches
      };
    case FETCH_BRANCHES_FAILED:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    case UPDATE_SELECTED_BRANCH:
      return {
        ...state,
        selectedBranch: action.payload.selectedBranch
      };

    default:
      return state;
  }
};
