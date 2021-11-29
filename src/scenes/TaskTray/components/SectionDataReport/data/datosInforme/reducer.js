import {
  FETCH_DATOS_INFORME_FINISHED,
  FETCH_DATOS_INFORME_STARTED,
  FETCH_DATOS_INFORME_RESET
} from 'scenes/TaskTray/components/SectionDataReport/data/datosInforme/action';

const initialState = {
  datosInforme: [],
  isLoading: false
};

export const obtenerDatoInforme = state =>
  state.scenes.taskTray.taskTrayComponents.sectionDatosInformes.datosInforme.datosInforme[0] || {};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_DATOS_INFORME_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_DATOS_INFORME_FINISHED:
      return {
        ...state,
        isLoading: false,
        datosInforme: action.payload.datosInforme
      };
    case FETCH_DATOS_INFORME_RESET:
      return {
        ...state,
        isLoading: false,
        datosInforme: []
      };
    default:
      return state;
  }
};
