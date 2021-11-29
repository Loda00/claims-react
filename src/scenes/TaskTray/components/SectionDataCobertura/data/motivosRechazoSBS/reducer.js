import {
  FETCH_MOTIVOS_RECHAZO_SBS_FAILED,
  FETCH_MOTIVOS_RECHAZO_SBS_RESET,
  FETCH_MOTIVOS_RECHAZO_SBS_STARTED,
  FETCH_MOTIVOS_RECHAZO_SBS_SUCCEEDED
} from 'scenes/TaskTray/components/SectionDataCobertura/data/motivosRechazoSBS/action';

const initialState = {
  motivosRechazoSbs: [],
  isLoading: false,
  error: null
};

export const getMotivosRechazoSbs = state =>
  state.scenes.taskTray.taskTrayComponents.sectionCoverages.data.motivosRechazoSbs.motivosRechazoSbs;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_MOTIVOS_RECHAZO_SBS_STARTED:
      return {
        ...state,
        isLoading: true
      };
    case FETCH_MOTIVOS_RECHAZO_SBS_SUCCEEDED:
      return {
        ...state,
        isLoading: false,
        motivosRechazoSbs: action.payload.motivosRechazoSbs
      };
    case FETCH_MOTIVOS_RECHAZO_SBS_FAILED:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    case FETCH_MOTIVOS_RECHAZO_SBS_RESET:
      return {
        ...state,
        isLoading: false,
        error: null,
        motivosRechazoSbs: []
      };
    default:
      return state;
  }
};
