import { combineReducers } from 'redux';
import { reducer as consultarRG } from 'scenes/TaskTray/scenes/SiniestroDuplicado/data/consultarRG/reducer';
import { reducer as consultarRGDuplicado } from 'scenes/TaskTray/scenes/SiniestroDuplicado/data/consultarRGDuplicado/reducer';
import { reducer as consultarCertificadoDuplicado } from 'scenes/TaskTray/scenes/SiniestroDuplicado/data/certificado/reducer';
import { reducer as consultarPolizaDuplicada } from 'scenes/TaskTray/scenes/SiniestroDuplicado/data/poliza/reducer';

export const reducer = combineReducers({
  consultarRG,
  consultarRGDuplicado,
  consultarCertificadoDuplicado,
  consultarPolizaDuplicada
});
