import {
  FETCH_CREAR_COBERTURA_STARTED,
  FETCH_CREAR_COBERTURA_FINISHED
} from 'scenes/TaskTray/components/SectionDataCobertura/data/crearCobertura/action';

const initialState = {
  cobertura: [],
  isLoading: false
};

export const getCoberturaLoading = state => {
  const {
    scenes: {
      taskTray: {
        taskTrayComponents: {
          sectionCoverages: {
            data: {
              crearCobertura: { isLoading }
            }
          }
        }
      }
    }
  } = state;
  return isLoading;
};

export const obtenerMotivos = state => {
  const {
    scenes: {
      taskTray: {
        taskTrayComponents: {
          sectionDataCobertura: {
            cobertura: { cobertura }
          }
        }
      }
    }
  } = state;
  return cobertura;
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_CREAR_COBERTURA_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_CREAR_COBERTURA_FINISHED:
      return {
        ...state,
        isLoading: false,
        cobertura: action.payload.cobertura
      };
    default:
      return state;
  }
};
