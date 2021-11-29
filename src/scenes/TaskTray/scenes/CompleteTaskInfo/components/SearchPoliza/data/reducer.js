import { combineReducers } from 'redux';
import { reducer as productsReducer } from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/SearchPoliza/data/products/reducer';
import { reducer as policiesReducer } from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/SearchPoliza/data/policies/reducer';
import { reducer as polizaLiderReducer } from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/SearchPoliza/data/bscPolizaLider/reducer';

export const reducer = combineReducers({
  products: productsReducer,
  policies: policiesReducer,
  polizaLider: polizaLiderReducer
});
