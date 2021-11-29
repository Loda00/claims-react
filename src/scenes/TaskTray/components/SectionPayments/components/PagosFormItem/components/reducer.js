import { combineReducers } from 'redux';
import { reducer as paymentTabsReducer } from 'scenes/TaskTray/components/SectionPayments/components/PagosFormItem/components/PaymentTabs/reducer';

export const reducer = combineReducers({
  paymentTabs: paymentTabsReducer
});
