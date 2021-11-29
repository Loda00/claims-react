import {
  FETCH_MOTIVO_FINISHED,
  FETCH_MOTIVO_STARTED
} from 'scenes/TaskTray/components/SectionDataReport/data/motivo/action';

const initialState = {
  motivos: [],
  isLoading: false
};

export const obtenerMotivos = state => state.scenes.taskTray.taskTrayComponents.sectionDatosInformes.motivos.motivos;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_MOTIVO_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_MOTIVO_FINISHED:
      return {
        ...state,
        isLoading: false,
        motivos: action.payload.motivos
      };
    default:
      return state;
  }
};
