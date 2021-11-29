import { combineReducers } from 'redux';

import { reducer as initialReducer } from 'scenes/TaskTray/components/SectionDataCertificate/data/dataCertificate/reducer';

export const reducer = combineReducers({
  dataCertificate: initialReducer
});
