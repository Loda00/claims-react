import fetchCreaParametro from 'scenes/Administracion/data/crearParametro/api';
import { fetch } from 'services/api/actions';

export const FETCH_CREAR_PARAMETRO_STARTED = 'Administracion/data/crearParametro/FETCH_CREAR_PARAMETRO_STARTED';
export const FETCH_CREAR_PARAMETRO_FINISHED = 'Administracion/data/crearParametro/FETCH_CREAR_PARAMETRO_FINISHED';
export const FETCH_CREAR_PARAMETRO_RESET = 'Administracion/data/crearParametro/FETCH_CREAR_PARAMETRO_RESET';

export function fetchCrearParametroStarted() {
  return {
    type: FETCH_CREAR_PARAMETRO_STARTED
  };
}

export function fetchCrearParametroFinished(crearParametro) {
  return {
    type: FETCH_CREAR_PARAMETRO_FINISHED,
    payload: {
      crearParametro
    }
  };
}

export function fetchCrearParametroReset() {
  return {
    type: FETCH_CREAR_PARAMETRO_RESET
  };
}

export const fetchCrearParametro = values => dispatch =>
  new Promise((resolve, reject) => {
    const { idRuta, codParametro, dscParametro, numOrden, dscTooltip, codTipo } = values;

    const data = {
      idRuta: codParametro.length > 0 ? `${idRuta}.${codParametro}` : idRuta,
      codParametro,
      dscParametro,
      numOrden,
      indActivo: 1,
      dscTooltip,
      codTipo
    };

    dispatch(fetchCrearParametroStarted());
    dispatch(fetch(fetchCreaParametro, data))
      .then(resp => {
        if (resp.code === 'CRG-000') {
          dispatch(fetchCrearParametroFinished(resp.data));
          resolve(resp);
        } else {
          dispatch(fetchCrearParametroFinished([]));
          resolve(resp);
        }
      })
      .catch(error => {
        dispatch(fetchCrearParametroFinished([]));
        reject(error);
      });
  });
