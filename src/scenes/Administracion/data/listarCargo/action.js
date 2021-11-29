import fetchListaCargo from 'scenes/Administracion/data/listarCargo/api';
import { fetch } from 'services/api/actions';

export const FETCH_LIST_CARGO_STARTED = 'Administracion/data/listarCargo/FETCH_LIST_CARGO_STARTED';
export const FETCH_LIST_CARGO_FINISHED = 'Administracion/data/listarCargo/FETCH_LIST_CARGO_FINISHED';
export const FETCH_LIST_CARGO_RESET = 'Administracion/data/listarCargo/FETCH_LIST_CARGO_RESET';

export function fetchListCargoStarted() {
  return {
    type: FETCH_LIST_CARGO_STARTED
  };
}

export function fetchListCargoFinished(listarCargo) {
  return {
    type: FETCH_LIST_CARGO_FINISHED,
    payload: {
      listarCargo
    }
  };
}

export function fetchListCargoReset() {
  return {
    type: FETCH_LIST_CARGO_RESET
  };
}
/**
 * @return una promesa que dispara un creador de accion fetchListCargoStarted
 * y tambien dispara otra creadora de accion fetch que recibe
 * una promesa y un body, se le envia como argumento de primer parametro una promesa
 * api.fetchListCargo que retorna fetchApi.post que recibe 2 parametros
 * endpoint y data(body): como argumento del primer parametro se le manda un string y
 * como segundo argumento un body y esto va a retornar un api_name que es el
 * nombre del servicio de rimac en aws, el endpoint que esta configurado pero se le
 * concatenara el enviado y el objeto init creado en post.
 * Y como segundo parametro recibe un objeto.
 * Obtiene la respuesta exitosa a traves del then que contiene el switch y dependiendo
 * del codigo:
 * Si es CRG-000 dispara la creadora de accion fetchListCargoFinished que recibe como
 * argumento la resp.data y la setea en payload y resolve.
 * Y por default dispara la funcion creadora de accion fetchListCargoFinished y
 * le envia un array vacio pero en este caso rechazo con resp.message.
 * En el caso de catch tambien dispara la funcion creadora de acciones
 * fetchListCargoFinished con un array vacio de argumento por lo que payload seria un array vacio.
 */
export function fetchListCargo() {
  return dispatch =>
    new Promise((resolve, reject) => {
      dispatch(fetchListCargoStarted());
      dispatch(fetch(fetchListaCargo, {}))
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchListCargoFinished(resp.data));
            resolve();
          } else {
            dispatch(fetchListCargoFinished([]));
            reject(resp.message);
          }
        })
        .catch(() => {
          dispatch(fetchListCargoFinished([]));
        });
    });
}
