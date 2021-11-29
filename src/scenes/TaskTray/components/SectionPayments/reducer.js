import { combineReducers } from 'redux';

import { reducer as dataReducer } from 'scenes/TaskTray/components/SectionPayments/data/reducer';
import { reducer as componentsReducer } from 'scenes/TaskTray/components/SectionPayments/components/reducer';

export const reducer = combineReducers({
  data: dataReducer,
  components: componentsReducer
});
