import { reducer as initialReducer } from 'scenes/CargaMasiva/data/sendCargaMasiva/reducer';
import { reducer as tiposCargaReducer } from 'scenes/CargaMasiva/data/obtenerCargas/reducer';
import { reducer as cargaCatastrofico } from 'scenes/CargaMasiva/data/cargaMasivaCatastrofico/reducer';
import { reducer as tipoCarga } from 'scenes/CargaMasiva/data/tipoCarga/reducer';
import { reducer as coasegurador } from 'scenes/CargaMasiva/data/coasegurador/reducer';
import { reducer as tipoOperacion } from 'scenes/CargaMasiva/data/tipoOperacion/reducer';
import { reducer as cargaCoaseguro } from 'scenes/CargaMasiva/data/cargaMasivaCoaseguro/reducer';
import { combineReducers } from 'redux';

export const reducer = combineReducers({
  sendCargaMasiva: initialReducer,
  tiposCarga: tiposCargaReducer,
  cargaCatastrofico,
  tipoCarga,
  coasegurador,
  tipoOperacion,
  cargaCoaseguro
});
