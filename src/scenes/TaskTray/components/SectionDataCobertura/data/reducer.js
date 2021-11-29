import { combineReducers } from 'redux';
import { reducer as coveragesAdjustersReducer } from 'scenes/TaskTray/components/SectionDataCobertura/data/coveragesAdjusters/reducer';
import { reducer as crearCobertura } from 'scenes/TaskTray/components/SectionDataCobertura/data/crearCobertura/reducer';
import { reducer as editarCobertura } from 'scenes/TaskTray/components/SectionDataCobertura/data/editarCobertura/reducer';
import { reducer as motivosRechazo } from 'scenes/TaskTray/components/SectionDataCobertura/data/motivosRechazo/reducer';
import { reducer as motivosRechazoSbs } from 'scenes/TaskTray/components/SectionDataCobertura/data/motivosRechazoSBS/reducer';
import { reducer as anularCobertura } from 'scenes/TaskTray/components/SectionDataCobertura/data/anularCobertura/reducer';

export const reducer = combineReducers({
  coveragesAdjusters: coveragesAdjustersReducer,
  crearCobertura,
  editarCobertura,
  motivosRechazo,
  motivosRechazoSbs,
  anularCobertura
});
