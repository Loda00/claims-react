import { combineReducers } from 'redux';

import { reducer as OtherConceptsFormItemReducer } from 'scenes/TaskTray/components/SectionDataSinister/components/SinisterFormItem/components/OtherConceptsFormItem/reducer';

export const reducer = combineReducers({
  OtherConceptsFormItem: OtherConceptsFormItemReducer
});
