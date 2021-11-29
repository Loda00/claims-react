import { combineReducers } from 'redux';

import { reducer as reasignarReducer } from 'scenes/Query/Component/ConsultarSiniestro/data/reasignar/reducer';
import { reducer as listaEjecutivoReducer } from 'scenes/Query/Component/ConsultarSiniestro/data/listaEjecutivo/reducer';

export const reducer = combineReducers({
  reasignar: reasignarReducer,
  listaEjecutivo: listaEjecutivoReducer
});
