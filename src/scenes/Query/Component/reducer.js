import { combineReducers } from 'redux';
import { reducer as cargarRecuperoReducer } from 'scenes/Query/Component/CargarRecuperoForm/reducer';
import { reducer as cargarSalvamentoReducer } from 'scenes/Query/Component/CargarSalvamentoForm/reducer';
import { reducer as anularReducer } from 'scenes/components/Anular/reducer';
import { reducer as reaperturarReducer } from 'scenes/Query/Component/Reaperturar/reducer';
import { reducer as consultarSiniestroReducer } from 'scenes/Query/Component/ConsultarSiniestro/reducer';

export const reducer = combineReducers({
  cargarRecupero: cargarRecuperoReducer,
  cargarSalvamento: cargarSalvamentoReducer,
  anular: anularReducer,
  reaperturar: reaperturarReducer,
  consultarSiniestro: consultarSiniestroReducer
});
