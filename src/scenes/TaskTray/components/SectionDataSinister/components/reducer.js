import { combineReducers } from 'redux';

import { reducer as SinisterFormItemReducer } from 'scenes/TaskTray/components/SectionDataSinister/components/SinisterFormItem/reducer';

export const reducer = combineReducers({
  SinisterFormItem: SinisterFormItemReducer
});
