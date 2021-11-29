import {
  FETCH_ADJUSTERS_STARTED,
  FETCH_ADJUSTERS_FINISHED,
  FETCH_ADJUSTERS_RESET,
  SET_COD_RAMO
} from 'scenes/TaskTray/components/SectionPayments/data/adjusters/actions';

const initialState = {
  adjusters: [],
  isLoading: false,
  adjusterSinister: {}
};

export const getAdjusters = state => state.scenes.taskTray.taskTrayComponents.searchRegistry.data.adjusters;
export const getAdjusterByCodigo = (state, codigo) => {
  return state.scenes.taskTray.taskTrayComponents.searchRegistry.data.adjusters.adjusters.find(
    adjuster => adjuster.codAjustador === codigo
  );
};

export const getAdjusterSinister = state => {
  return state.scenes.taskTray.taskTrayComponents.searchRegistry.data.adjusters.adjusterSinister;
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ADJUSTERS_STARTED:
      return {
        ...state,
        isLoading: true
      };
    case FETCH_ADJUSTERS_FINISHED:
      return {
        ...state,
        isLoading: false,
        adjusters: {
          ...state.adjusters,
          [action.payload.codRamo]: action.payload.adjusters
        }
      };
    case FETCH_ADJUSTERS_RESET:
      return {
        ...state,
        adjusterSinister: {}
      };
    case SET_COD_RAMO:
      return {
        ...state,
        adjusterSinister: state.adjusters[action.payload.codRamo].find(
          ajust => ajust.idAjustador === action.payload.idAjustadorSiniestro
        )
      };
    default:
      return state;
  }
};
