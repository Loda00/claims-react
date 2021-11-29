import { combineReducers } from 'redux';
import { reducer as certificatesReducer } from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/SearchCertificado/data/certificates/reducer';

export const reducer = combineReducers({
  certificates: certificatesReducer
});
