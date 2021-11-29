import {
  FETCH_INCOTERMS_STARTED,
  FETCH_INCOTERMS_FINISHED
} from 'scenes/TaskTray/components/SectionDataSinister/data/incoterms/actions';

const initialState = {
  incoterms: [],
  isLoading: false
};

export const getIncoterms = state => state.scenes.taskTray.taskTrayComponents.sectionDataSinister.data.incoterms;

export const getLstIncoterms = state =>
  state.scenes.taskTray.taskTrayComponents.sectionDataSinister.data.incoterms.incoterms || [];

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_INCOTERMS_STARTED:
      return {
        ...state,
        isLoading: true
      };
    case FETCH_INCOTERMS_FINISHED:
      return {
        ...state,
        isLoading: false,
        incoterms: action.payload.incoterms
      };
    default:
      return state;
  }
};
