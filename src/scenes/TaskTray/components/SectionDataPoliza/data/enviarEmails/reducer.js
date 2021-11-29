import {
  ENVIAR_EMAILS_STARTED,
  ENVIAR_EMAILS_FINISHED,
  ENVIAR_EMAILS_RESET
} from 'scenes/TaskTray/components/SectionDataPoliza/data/enviarEmails/actions';

const initialState = {
  response: [],
  isLoading: false
};

export const obtenerResponseEnviarEmails = state => {
  return state.scenes.taskTray.taskTrayComponents.sectionDataPoliza.data.enviarEmails.response[0] || {};
};

export const getIsLoadingEnviarEmails = state => {
  return state.scenes.taskTray.taskTrayComponents.sectionDataPoliza.data.enviarEmails.isLoading;
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ENVIAR_EMAILS_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case ENVIAR_EMAILS_FINISHED:
      return {
        ...state,
        isLoading: false,
        response: action.payload.data
      };
    case ENVIAR_EMAILS_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
