import { combineReducers } from 'redux';
import { reducer as coordenadasReducer } from 'scenes/TaskTray/components/SectionPayments/components/PagosFormItem/components/PaymentTabs/components/Coordenadas/reducer';

export const reducer = combineReducers({
  coordenadas: coordenadasReducer
});
