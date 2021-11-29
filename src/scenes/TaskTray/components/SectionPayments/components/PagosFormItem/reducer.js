import { combineReducers } from 'redux';
import { reducer as componentsReducer } from 'scenes/TaskTray/components/SectionPayments/components/PagosFormItem/components/reducer';

export const reducer = combineReducers({
  components: componentsReducer
});
