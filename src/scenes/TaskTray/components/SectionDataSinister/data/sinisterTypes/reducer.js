import {
  FETCH_SINISTER_TYPES_STARTED,
  FETCH_SINISTER_TYPES_FINISHED,
  FETCH_SINISTER_TYPES_RESET
} from 'scenes/TaskTray/components/SectionDataSinister/data/sinisterTypes/actions';

const initialState = {
  sinisterTypes: [],
  isLoading: false
};

export const getSinisterTypes = state =>
  state.scenes.taskTray.taskTrayComponents.sectionDataSinister.data.sinisterTypes;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_SINISTER_TYPES_STARTED:
      return {
        ...state,
        isLoading: true
      };
    case FETCH_SINISTER_TYPES_FINISHED:
      return {
        ...state,
        isLoading: false,
        sinisterTypes: action.payload.sinisterTypes
      };
    case FETCH_SINISTER_TYPES_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
