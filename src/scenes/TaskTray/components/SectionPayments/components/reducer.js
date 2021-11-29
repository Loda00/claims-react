import { combineReducers } from 'redux';
import { reducer as pagosFormItemReducer } from 'scenes/TaskTray/components/SectionPayments/components/PagosFormItem/reducer';

export const reducer = combineReducers({
  pagosFormItem: pagosFormItemReducer
});
