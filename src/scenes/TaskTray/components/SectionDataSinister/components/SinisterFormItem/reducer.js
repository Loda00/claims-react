import { combineReducers } from 'redux';

import { reducer as componentsReducer } from 'scenes/TaskTray/components/SectionDataSinister/components/SinisterFormItem/components/reducer';

export const reducer = combineReducers({
  components: componentsReducer
});
