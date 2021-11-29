import {
  FETCH_EDITAR_COBERTURA_STARTED,
  FETCH_EDITAR_COBERTURA_FINISHED
} from 'scenes/TaskTray/components/SectionDataCobertura/data/editarCobertura/action';

const initialState = {
  cobertura: [],
  isLoading: false
};

export const obtenerMotivos = state =>
  state.scenes.taskTray.taskTrayComponents.sectionDataCobertura.cobertura.cobertura;
export const loading = state =>
  state.scenes.taskTray.taskTrayComponents.sectionCoverages.data.editarCobertura.isLoading;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_EDITAR_COBERTURA_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_EDITAR_COBERTURA_FINISHED:
      return {
        ...state,
        isLoading: false,
        cobertura: action.payload.cobertura
      };
    default:
      return state;
  }
};
