import { combineReducers } from 'redux';
import { reducer as datosInformeReducer } from 'scenes/TaskTray/components/SectionDataReport/data/datosInforme/reducer';
import { reducer as motivos } from 'scenes/TaskTray/components/SectionDataReport/data/motivo/reducer';
import { reducer as ajustadores } from 'scenes/TaskTray/components/SectionDataReport/data/ajustadores/reducer';

export const reducer = combineReducers({
  datosInforme: datosInformeReducer,
  motivos,
  ajustadores
});
