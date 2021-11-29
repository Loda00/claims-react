import { combineReducers } from 'redux';

import { reducer as dataCertificateReducer } from 'scenes/TaskTray/components/SectionDataCertificate/data/reducer';

export const reducer = combineReducers({
  data: dataCertificateReducer
});
