import { combineReducers } from 'redux';

import { reducer as initialReducer } from 'scenes/TaskTray/components/SectionDataPoliza/data/dataPoliza/reducer';
import { reducer as enviarEmailsReducer } from 'scenes/TaskTray/components/SectionDataPoliza/data/enviarEmails/reducer';

export const reducer = combineReducers({
  dataPoliza: initialReducer,
  enviarEmails: enviarEmailsReducer
});
