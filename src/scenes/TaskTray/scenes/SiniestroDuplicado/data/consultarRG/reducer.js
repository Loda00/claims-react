import {
  FETCH_RG1_FAILED,
  FETCH_RG1_RESET,
  FETCH_RG1_STARTED,
  FETCH_RG1_SUCCEEDED
} from 'scenes/TaskTray/scenes/SiniestroDuplicado/data/consultarRG/action';

const initialState = {
  rg: [],
  isLoading: false,
  error: null
};

export const getRGClaims = state => state.scenes.taskTray.completeTaskInfo.duplicados.consultarRG.rg;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_RG1_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_RG1_RESET:
      return {
        ...initialState
      };
    case FETCH_RG1_SUCCEEDED:
      return {
        ...state,
        isLoading: false,
        rg: action.payload.rg
      };
    case FETCH_RG1_FAILED:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    default:
      return state;
  }
};
