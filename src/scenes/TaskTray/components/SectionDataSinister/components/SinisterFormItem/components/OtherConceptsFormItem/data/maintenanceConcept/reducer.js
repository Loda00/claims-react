import {
  FECTH_MAINTENANCE_CONCEPT_STARTED,
  FECTH_MAINTENANCE_CONCEPT_FINISHED
} from 'scenes/TaskTray/components/SectionDataSinister/components/SinisterFormItem/components/OtherConceptsFormItem/data/maintenanceConcept/action';

const initialState = {
  otherConcepts: null,
  isLoading: false
};

export const getIsLoading = state =>
  state.scenes.taskTray.taskTrayComponents.sectionDataSinister.components.SinisterFormItem.components
    .OtherConceptsFormItem.data.maintenanceConcept.isLoading;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FECTH_MAINTENANCE_CONCEPT_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FECTH_MAINTENANCE_CONCEPT_FINISHED:
      return {
        ...state,
        isLoading: false
        // otherConcepts: action.payload.data
      };
    default:
      return state;
  }
};
