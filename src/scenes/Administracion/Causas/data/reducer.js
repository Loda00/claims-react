import { combineReducers } from 'redux';
import { reducer as mantenerCausaReducer } from 'scenes/Administracion/Causas/data/mantenerCausa/reducer';

export const reducer = combineReducers({
  mantenerCausa: mantenerCausaReducer
});
