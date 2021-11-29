import {
  FETCH_RG1_DUPLICADO_FAILED,
  FETCH_RG1_DUPLICADO_RESET,
  FETCH_RG1_DUPLICADO_STARTED,
  FETCH_RG1_DUPLICADO_SUCCEEDED
} from 'scenes/TaskTray/scenes/SiniestroDuplicado/data/consultarRGDuplicado/action';

const initialState = {
  duplicado: [],
  isLoading: false,
  error: null
};

export const getRGDuplicado = state => state.scenes.taskTray.completeTaskInfo.duplicados.consultarRGDuplicado.duplicado;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_RG1_DUPLICADO_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_RG1_DUPLICADO_RESET:
      return {
        ...initialState
      };
    case FETCH_RG1_DUPLICADO_SUCCEEDED:
      return {
        ...state,
        isLoading: false,
        duplicado: action.payload.duplicado
      };
    case FETCH_RG1_DUPLICADO_FAILED:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    default:
      return state;
  }
};
