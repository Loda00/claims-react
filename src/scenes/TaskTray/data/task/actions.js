import * as api from 'scenes/TaskTray/data/task/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';

import * as taskTableActionCreators from 'scenes/TaskTray/scenes/TaskTrayHome/data/taskTable/actions';
import * as uiActionCreators from 'services/ui/actions';

export const TAKE_TASK_STARTED = 'scenes/TaskTray/data/task/TAKE_TASK_STARTED';
export const TAKE_TASK_SUCCEEDED = 'scenes/TaskTray/data/task/TAKE_TASK_SUCCEEDED';
export const TAKE_TASK_FAILED = 'scenes/TaskTray/data/task/TAKE_TASK_FAILED';
export const GUARDAR_SINIESTRO_COMENZADO = 'scenes/TaskTray/data/task/GUARDAR_SINIESTRO_COMENZADO';
export const GUARDAR_SINIESTRO_FINALIZADO = 'scenes/TaskTray/data/task/GUARDAR_SINIESTRO_FINALIZADO';
export const GUARDAR_SINIESTRO_REINICIADO = 'scenes/TaskTray/data/task/GUARDAR_SINIESTRO_REINICIADO';

export function takeTaskStarted() {
  return {
    type: TAKE_TASK_STARTED
  };
}

export function takeTaskFailed(error) {
  return {
    type: TAKE_TASK_FAILED,
    payload: error
  };
}

export function takeTaskSucceeded() {
  return {
    type: TAKE_TASK_SUCCEEDED
  };
}

export function guardarSiniestroComenzado() {
  return {
    type: GUARDAR_SINIESTRO_COMENZADO
  };
}

export function guardarSiniestroFinalizado() {
  return {
    type: GUARDAR_SINIESTRO_FINALIZADO
  };
}

export function guardarSiniestroReiniciado() {
  return {
    type: GUARDAR_SINIESTRO_REINICIADO
  };
}

export const takeTask = (nombre, currentTask, userClaims) => dispatch =>
  new Promise((resolve, reject) => {
    const { numSiniestro, idCaso, codTarea, nomTarea } = currentTask;
    const { idProceso } = userClaims;

    dispatch(takeTaskStarted());
    dispatch(
      fetch(api.takeTask, {
        nombre,
        numSiniestro,
        numCaso: idCaso,
        codTarea,
        idUsuarioProceso: idProceso,
        nomTarea
      })
    )
      .then(resp => {
        switch (resp.code) {
          case 'CRG-000':
            dispatch(takeTaskSucceeded());
            dispatch(taskTableActionCreators.updateTakenTask(numSiniestro));
            resolve(resp);
            break;
          default:
            dispatch(takeTaskFailed({ message: 'Ocurrió un error al tomar tarea' }));
            reject(resp);
        }
      })
      .catch(error => {
        dispatch(takeTaskFailed({ message: 'Ocurrió un error inesperado al tomar tarea' }));
        reject(error);
      });
  });

/**
 * Esta funcion es un creador de acciones
 * @param request es el json que se recibe de los datos ingresados
 * crea una promesa y esto dispara la funcion creadora de acciones guardarSiniestroFinalizado
 * y tambien dispara la funcion fetch que recibe una promesa y el body como parametros
 * y se le envia como argumentos la funcion guardarSiniestro de api(que devuelve una promesa y
 * hace uso del metodo .post(function) que recibe un endpoint y data como parametros
 * y crea un objeto con key headers y un body que es el argumento data y retorna la respuesta
 * del metodo .post de api de aws-amplify al cual se le envia como parametros el api_name,
 * el endpoint que es /guardaranalizarsiniestro y myInit que es el objeto declarado en la function post)
 * y el request que es el json de la data ingresada,
 * @return then
 * se obtiene la respuesta exitosa a traves de then
 * dependiendo del codigo de la respuesta:
 * Si es CRG-000 se dispara takeTaskSucceeded que es creadora de
 * la accion take_task_succeeded y dispara guadarSiniestroFinalizado que es otra creadora de accion
 * guardar_Siniestro_Finalizado y resuelve resp.
 * Y por default dispara la funcion guardarSiniestroFinalizado creadora de accion guardar_Siniestro_Finalizado
 * pero rechaza(reject) resp
 * @return catch
 * en el caso de catch con el que obtiene el error y tambien dispara
 * guardarSiniestroFinalizado la funcion creadora de la accion guardar_Siniestro_Finalizado y rechaza(reject)
 * error(el error)
 *  */

export const guardarSiniestro = request => dispatch =>
  new Promise((resolve, reject) => {
    dispatch(uiActionCreators.switchLoader());
    dispatch(guardarSiniestroComenzado());
    dispatch(fetch(api.guardarSiniestro, request))
      .then(resp => {
        switch (resp.code) {
          case 'CRG-000':
            dispatch(takeTaskSucceeded());
            dispatch(guardarSiniestroFinalizado());
            dispatch(uiActionCreators.switchLoader());
            resolve(resp);
            break;
          default:
            dispatch(guardarSiniestroFinalizado());
            dispatch(uiActionCreators.switchLoader());
            reject(resp);
        }
      })
      .catch(error => {
        dispatch(guardarSiniestroFinalizado());
        dispatch(uiActionCreators.switchLoader());
        reject(error);
      });
  });

export const completarTarea = data => dispatch =>
  new Promise((resolve, reject) => {
    dispatch(uiActionCreators.switchLoader());
    dispatch(fetch(api.completeTask, data))
      .then(resp => {
        switch (resp.code) {
          case 'CRG-000':
            dispatch(uiActionCreators.switchLoader());
            resolve(resp);
            break;
          case 'CRG-599':
            dispatch(uiActionCreators.switchLoader());
            resolve(resp);
            break;
          default:
            dispatch(uiActionCreators.switchLoader());
            reject(resp);
        }
      })
      .catch(error => {
        dispatch(uiActionCreators.switchLoader());
        reject(error);
      });
  });

export const modificarSiniestro = data => dispatch =>
  new Promise((resolve, reject) => {
    dispatch(uiActionCreators.switchLoader());
    dispatch(fetch(api.modificarSiniestro, data))
      .then(resp => {
        if (resp.code === 'CRG-000') {
          dispatch(uiActionCreators.switchLoader());
          resolve(resp);
        } else {
          dispatch(uiActionCreators.switchLoader());
          reject(resp);
        }
      })
      .catch(error => {
        dispatch(uiActionCreators.switchLoader());
        reject(error);
      });
  });
