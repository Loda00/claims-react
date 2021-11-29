import { combineReducers } from 'redux';
import { reducer as motivoAnularReducer } from 'scenes/components/Anular/data/motivoAnular/reducer';
import { reducer as anularSiniestroReducer } from 'scenes/components/Anular/data/anularSiniestro/reducer';

export const reducer = combineReducers({
  motivoAnular: motivoAnularReducer,
  anularSiniestro: anularSiniestroReducer
});
