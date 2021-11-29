import * as api from 'scenes/Administracion/Ajustadores/data/mantenerAjustador/api';
import { fetch } from 'services/api/actions';

export const FETCH_MNT_AJUSTADOR_STARTED =
  'Administracion/Ajustadores/data/mantenerAjustador/FETCH_MNT_AJUSTADOR_STARTED';
export const FETCH_MNT_AJUSTADOR_FINISHED =
  'Administracion/Ajustadores/data/mantenerAjustador/FETCH_MNT_AJUSTADOR_FINISHED';

export function fetchMantenimientoAjustadorStarted() {
  return {
    type: FETCH_MNT_AJUSTADOR_STARTED
  };
}

export function fetchMantenimientoAjustadorFinished() {
  return {
    type: FETCH_MNT_AJUSTADOR_FINISHED
  };
}

export function fetchMantenimientoAjustador(
  operacion,
  codAjustador,
  nomAjustador,
  emailAjustador,
  idAjustador,
  idPersona,
  ramos,
  indHabilitado,
  idCoreAjustador
) {
  return (dispatch, getState) =>
    new Promise(function(resolve, reject) {
      dispatch(fetchMantenimientoAjustadorStarted());
      dispatch(
        fetch(api.fetchMantenimientoAjustador, {
          operacion,
          codAjustador,
          nomAjustador,
          emailAjustador,
          idAjustador,
          idPersona,
          ramos,
          indHabilitado,
          idCoreAjustador
        })
      )
        .then(resp => {
          if (resp.code === 'CRG-000' || resp.code === 'CRG-200') {
            dispatch(fetchMantenimientoAjustadorFinished());
            resolve(resp);
          } else {
            dispatch(fetchMantenimientoAjustadorFinished());
            resolve(resp.message);
          }
        })
        .catch(error => {
          dispatch(fetchMantenimientoAjustadorFinished());
        });
    });
}
