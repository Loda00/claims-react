import { combineReducers } from 'redux';

import { reducer as dataReducer } from 'scenes/TaskTray/components/SectionDataSinister/components/SinisterFormItem/components/OtherConceptsFormItem/data/reducer';

export const reducer = combineReducers({
  data: dataReducer
});
