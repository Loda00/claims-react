import { combineReducers } from 'redux';
import { reducer as coordenadaReducer } from 'scenes/TaskTray/components/SectionPayments/components/PagosFormItem/components/PaymentTabs/components/Coordenadas/data/coordenadas/reducer';

export const reducer = combineReducers({
  coordenada: coordenadaReducer
});
