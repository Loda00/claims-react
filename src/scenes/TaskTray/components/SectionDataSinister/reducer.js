import { combineReducers } from 'redux';

import { reducer as dataSinisterReducer } from 'scenes/TaskTray/components/SectionDataSinister/data/reducer';
import { reducer as componentsReducer } from 'scenes/TaskTray/components/SectionDataSinister/components/reducer';

export const reducer = combineReducers({
  data: dataSinisterReducer,
  components: componentsReducer
});
