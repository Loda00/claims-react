import { combineReducers } from 'redux';

import { reducer as dataReducer } from 'scenes/TaskTray/components/SectionSalvamentoRecupero/data/reducer';

export const reducer = combineReducers({
  data: dataReducer
});
