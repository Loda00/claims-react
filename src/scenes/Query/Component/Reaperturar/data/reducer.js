import { combineReducers } from 'redux';
import { reducer as motivoReaperturarReducer } from 'scenes/Query/Component/Reaperturar/data/motivoReaperturar/reducer';
import { reducer as reaperturarSiniestroReducer } from 'scenes/Query/Component/Reaperturar/data/reaperturarSiniestro/reducer';

export const reducer = combineReducers({
  motivoReaperturar: motivoReaperturarReducer,
  reaperturarSiniestro: reaperturarSiniestroReducer
});
