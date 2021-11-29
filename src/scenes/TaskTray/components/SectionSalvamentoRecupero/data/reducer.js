import { combineReducers } from 'redux';

import { reducer as listRecoveredReducer } from 'scenes/TaskTray/components/SectionSalvamentoRecupero/data/listRecovered/reducer';
import { reducer as listSalvamentoReducer } from 'scenes/TaskTray/components/SectionSalvamentoRecupero/data/listSalvamento/reducer';

export const reducer = combineReducers({
  listRecovered: listRecoveredReducer,
  listSalvamento: listSalvamentoReducer
});
