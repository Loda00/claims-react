import { combineReducers } from 'redux';

import { reducer as maintenanceConceptReducer } from 'scenes/TaskTray/components/SectionDataSinister/components/SinisterFormItem/components/OtherConceptsFormItem/data/maintenanceConcept/reducer';

export const reducer = combineReducers({
  maintenanceConcept: maintenanceConceptReducer
});
