import { combineReducers } from 'redux';

import { reducer as searchRegistryReducer } from 'scenes/TaskTray/components/SectionPayments/reducer';
import { reducer as sectionBitacoraReducer } from 'scenes/TaskTray/components/SectionBitacora/reducer';

import { reducer as sectionDataCoberturaReducer } from 'scenes/TaskTray/components/SectionDataCobertura/reducer';

import { reducer as sectionHistoryChangeReducer } from 'scenes/TaskTray/components/SectionHistoryChange/reducer';

import { reducer as sectionDataPolizaReducer } from 'scenes/TaskTray/components/SectionDataPoliza/reducer';
import { reducer as sectionDataCertificateReducer } from 'scenes/TaskTray/components/SectionDataCertificate/reducer';
import { reducer as sectionDataSinisterReducer } from 'scenes/TaskTray/components/SectionDataSinister/reducer';

import { reducer as sectionDocumentSinisterReducer } from 'scenes/TaskTray/components/SectionDocumentSinister/reducer';

import { reducer as sectionSalvamentoRecuperoReducer } from 'scenes/TaskTray/components/SectionSalvamentoRecupero/reducer';
import { reducer as sectionDatosInformes } from 'scenes/TaskTray/components/SectionDataReport/data/reducer.js';

export const reducer = combineReducers({
  searchRegistry: searchRegistryReducer,
  sectionBitacora: sectionBitacoraReducer,
  sectionCoverages: sectionDataCoberturaReducer,
  sectionHistoryChange: sectionHistoryChangeReducer,
  sectionDataPoliza: sectionDataPolizaReducer,
  sectionDataCertificate: sectionDataCertificateReducer,
  sectionDataSinister: sectionDataSinisterReducer,
  sectionDocumentSinister: sectionDocumentSinisterReducer,
  sectionSalvamentoRecupero: sectionSalvamentoRecuperoReducer,
  sectionDatosInformes
});
