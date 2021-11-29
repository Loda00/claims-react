import {
  FETCH_ANULAR_COBERTURA_FINISHED,
  FETCH_ANULAR_COBERTURA_STARTED
} from 'scenes/TaskTray/components/SectionDataCobertura/data/anularCobertura/action';

const initialState = {
  cobertura: [],
  isLoading: false
};

export const loading = state =>
  state.scenes.taskTray.taskTrayComponents.sectionCoverages.data.anularCobertura.isLoading;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ANULAR_COBERTURA_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_ANULAR_COBERTURA_FINISHED:
      return {
        ...state,
        isLoading: false,
        cobertura: action.payload.cobertura
      };
    default:
      return state;
  }
};
