import { combineReducers } from 'redux';
import { reducer as listarCargoReducer } from 'scenes/Administracion/data/listarCargo/reducer';
import { reducer as listarPersonaReducer } from 'scenes/Administracion/data/listarPersona/reducer';
import { reducer as listarAjustadorReducer } from 'scenes/Administracion/data/listarAjustador/reducer';
import { reducer as listarCausaReducer } from 'scenes/Administracion/data/listarCausa/reducer';
import { reducer as listarConsecuenciaReducer } from 'scenes/Administracion/data/listarConsecuencia/reducer';
import { reducer as listarRamoReducer } from 'scenes/Administracion/data/listarRamo/reducer';
import { reducer as listarRamoAjustadorReducer } from 'scenes/Administracion/data/listarRamoAjustador/reducer';
import { reducer as obtenerPersonaReducer } from 'scenes/Administracion/data/obtenerPersona/reducer';
import { reducer as listarRolesReducer } from 'scenes/Administracion/data/listarRoles/reducer';
import { reducer as crearPersonaReducer } from 'scenes/Administracion/data/crearPersona/reducer';
import { reducer as actualizarPersonaReducer } from 'scenes/Administracion/data/actualizarPersona/reducer';
import { reducer as listarPosiblesReemplazosReducer } from 'scenes/Administracion/data/listarPosiblesReemplazos/reducer';
import { reducer as obtenerReemplazoReducer } from 'scenes/Administracion/data/obtenerReemplazos/reducer';
import { reducer as obtenerJefesReducer } from 'scenes/Administracion/data/obtenerJefes/reducer';
import { reducer as crearAusenciaReducer } from 'scenes/Administracion/data/crearAusencia/reducer';
import { reducer as eliminarAusenciaReducer } from 'scenes/Administracion/data/eliminarAusencia/reducer';
import { reducer as obtenerAusenciaReducer } from 'scenes/Administracion/data/obtenerAusencia/reducer';
import { reducer as listarAusenciasReducer } from 'scenes/Administracion/data/listarAusencias/reducer';
import { reducer as actualizarAusenciasReducer } from 'scenes/Administracion/data/actPersonaAusencia/reducer';
import { reducer as eliminarReemplazosReducer } from 'scenes/Administracion/data/eliminarReemplazo/reducer';
import { reducer as listaParametrosReducer } from 'scenes/Administracion/data/obtenerListaParam/reducer';
import { reducer as bscParametrosReducer } from 'scenes/Administracion/data/bscParametros/reducer';
import { reducer as buscarParametrosReducer } from 'scenes/Administracion/data/buscarParametros/reducer';
import { reducer as buscarNotificacionesReducer } from 'scenes/Administracion/data/buscarNotificaciones/reducer';
import { reducer as actualizarParametrosNotificacionesReducer } from 'scenes/Administracion/data/actualizarParametrosNotificaciones/reducer';
import { reducer as actualizarUtlParametroReducer } from 'scenes/Administracion/data/actualizarUtlParametro/reducer';
import { reducer as crearParametroReducer } from 'scenes/Administracion/data/crearParametro/reducer';
import { reducer as listarEquiposReducer } from 'scenes/Administracion/data/listarEquipos/reducer';
import { reducer as crearSubparametroReducer } from 'scenes/Administracion/data/crearSubparametro/reducer';
import { reducer as eliminarPersonaReducer } from 'scenes/Administracion/data/eliminarPersona/reducer';
import { reducer as reactivarPersonaReducer } from 'scenes/Administracion/data/reactivarPersona/reducer';

export const reducer = combineReducers({
  listarCargo: listarCargoReducer,
  listarPersona: listarPersonaReducer,
  listarAjustador: listarAjustadorReducer,
  listarCausa: listarCausaReducer,
  listarConsecuencia: listarConsecuenciaReducer,
  listarRamo: listarRamoReducer,
  listarRamoAjustador: listarRamoAjustadorReducer,
  obtenerPersona: obtenerPersonaReducer,
  listarRoles: listarRolesReducer,
  crearPersona: crearPersonaReducer,
  actualizarPersona: actualizarPersonaReducer,
  listarPosiblesReemplazos: listarPosiblesReemplazosReducer,
  obtenerReemplazos: obtenerReemplazoReducer,
  obtenerJefes: obtenerJefesReducer,
  crearAusencia: crearAusenciaReducer,
  eliminarAusencia: eliminarAusenciaReducer,
  obtenerAusencia: obtenerAusenciaReducer,
  listarAusencias: listarAusenciasReducer,
  actualizarAusencia: actualizarAusenciasReducer,
  eliminarReemplazos: eliminarReemplazosReducer,
  listaParametros: listaParametrosReducer,
  bscParametros: bscParametrosReducer,
  buscarParametros: buscarParametrosReducer,
  buscarNotificaciones: buscarNotificacionesReducer,
  actualizarParametrosNotificaciones: actualizarParametrosNotificacionesReducer,
  actualizarUtlParametro: actualizarUtlParametroReducer,
  crearParametro: crearParametroReducer,
  listarEquipos: listarEquiposReducer,
  crearSubparametro: crearSubparametroReducer,
  eliminarPersona: eliminarPersonaReducer,
  reactivarPersona: reactivarPersonaReducer
});
