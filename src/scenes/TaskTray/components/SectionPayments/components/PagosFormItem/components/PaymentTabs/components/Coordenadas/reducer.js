import { combineReducers } from 'redux';
import { reducer as dataReducer } from 'scenes/TaskTray/components/SectionPayments/components/PagosFormItem/components/PaymentTabs/components/Coordenadas/data/reducer';

export const reducer = combineReducers({
  data: dataReducer
});
