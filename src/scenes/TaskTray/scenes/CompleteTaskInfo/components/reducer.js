import { combineReducers } from 'redux';
import { reducer as searchPolizaReducer } from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/SearchPoliza/reducer';
import { reducer as searchCertificadoReducer } from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/SearchCertificado/reducer';
import { reducer as direccionSiniestroReducer } from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DireccionSiniestro/reducer';
import { reducer as datosCoberturaReducer } from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DatosCobertura/reducer';

export const reducer = combineReducers({
  searchPoliza: searchPolizaReducer,
  searchCertificado: searchCertificadoReducer,
  direccionSiniestro: direccionSiniestroReducer,
  datosCobertura: datosCoberturaReducer
});
