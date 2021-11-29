import {
  FETCH_MOTIVOS_RECHAZO_FAILED,
  FETCH_MOTIVOS_RECHAZO_RESET,
  FETCH_MOTIVOS_RECHAZO_STARTED,
  FETCH_MOTIVOS_RECHAZO_SUCCEEDED
} from 'scenes/TaskTray/components/SectionDataCobertura/data/motivosRechazo/action';

const initialState = {
  motivosRechazo: [],
  isLoading: false,
  error: null
};

export const getMotivosRechazo = state =>
  state.scenes.taskTray.taskTrayComponents.sectionCoverages.data.motivosRechazo.motivosRechazo;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_MOTIVOS_RECHAZO_STARTED:
      return {
        ...state,
        isLoading: true
      };
    case FETCH_MOTIVOS_RECHAZO_SUCCEEDED:
      return {
        ...state,
        isLoading: false,
        motivosRechazo: action.payload.motivosRechazo
      };
    case FETCH_MOTIVOS_RECHAZO_FAILED:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    case FETCH_MOTIVOS_RECHAZO_RESET:
      return {
        ...state,
        isLoading: false,
        error: null,
        motivosRechazo: []
      };
    default:
      return state;
  }
};
