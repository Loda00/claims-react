import { combineReducers } from 'redux';
import { reducer as paymentsReducer } from 'scenes/TaskTray/components/SectionPayments/data/payments/reducer';
import { reducer as paymentTypesReducer } from 'scenes/TaskTray/components/SectionPayments/data/paymentTypes/reducer';
import { reducer as coinTypesReducer } from 'scenes/TaskTray/components/SectionPayments/data/coinTypes/reducer';
import { reducer as chargeTypesReducer } from 'scenes/TaskTray/components/SectionPayments/data/chargeTypes/reducer';
import { reducer as adjustersReducer } from 'scenes/TaskTray/components/SectionPayments/data/adjusters/reducer';
import { reducer as docTypesReducer } from 'scenes/TaskTray/components/SectionPayments/data/docTypes/reducer';
import { reducer as accountTypesReducer } from 'scenes/TaskTray/components/SectionPayments/data/accountTypes/reducer';
import { reducer as entidadesReducer } from 'scenes/TaskTray/components/SectionPayments/data/entidades/reducer';

export const reducer = combineReducers({
  adjusters: adjustersReducer,
  payments: paymentsReducer,
  paymentTypes: paymentTypesReducer,
  coinTypes: coinTypesReducer,
  chargeTypes: chargeTypesReducer,
  docTypes: docTypesReducer,
  accountTypes: accountTypesReducer,
  entidades: entidadesReducer
});
