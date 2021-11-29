import * as api from 'scenes/TaskTray/scenes/ConfirmarGestion/data/tipoTarea/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';

export const FETCH_TIPO_TAREA_STARTED =
  'scenes/TaskTray/scenes/ConfirmarGestion/data/tipoTarea/FETCH_TIPO_TAREA_STARTED';
export const FETCH_TIPO_TAREA_FINISHED =
  'scenes/TaskTray/scenes/ConfirmarGestion/data/tipoTarea/FETCH_TIPO_TAREA_FINISHED';

export function fetchTipoTareaStarted() {
  return {
    type: FETCH_TIPO_TAREA_STARTED
  };
}

export function fetchTipoTareaFinished(data) {
  return {
    type: FETCH_TIPO_TAREA_FINISHED,
    paiload: {
      data: (data[0] || {}).tipo
    }
  };
}

export const fetchTipoTarea = request => dispatch =>
  new Promise((resolve, reject) => {
    dispatch(fetchTipoTareaStarted());
    dispatch(fetch(api.fetchTipoTarea, request))
      .then(resp => {
        switch (resp.code) {
          case 'CRG-000':
            dispatch(fetchTipoTareaFinished(resp.data));
            resolve(resp);
            break;
          default:
            dispatch(fetchTipoTareaFinished([]));
            reject(resp);
        }
      })
      .catch(error => {
        dispatch(fetchTipoTareaFinished([]));
        reject(CONSTANTS_APP.GENERIC_ERROR_MESSAGE);
      });
  });
