import { combineReducers } from 'redux';
import { reducer as listSalvamentoReducer } from 'scenes/Query/Component/CargarSalvamentoForm/data/listSalvamento/reducer';
import { reducer as saveSalvamentoReducer } from 'scenes/Query/Component/CargarSalvamentoForm/data/saveSalvamento/reducer';

export const reducer = combineReducers({
  listSalvamento: listSalvamentoReducer,
  saveSalvamento: saveSalvamentoReducer
});
