import {
  FETCH_LIST_REASIGNAR_STARTED,
  FETCH_LIST_REASIGNAR_FINISHED,
  FETCH_LIST_REASIGNAR_RESET
} from 'scenes/Query/Component/ConsultarSiniestro/data/reasignar/action';

const initialState = {
  reasignar: [],
  isLoading: false
};

export const getReasignar = state => state.scenes.query.component.consultarSiniestro.data.reasignar;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_LIST_REASIGNAR_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_LIST_REASIGNAR_FINISHED:
      return {
        ...state,
        isLoading: false,
        reasignar: action.payload.reasignar
      };
    case FETCH_LIST_REASIGNAR_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
