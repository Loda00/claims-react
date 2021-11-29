import fetchCreaSubparametro from 'scenes/Administracion/data/crearSubparametro/api';
import { fetch } from 'services/api/actions';

export const FETCH_CREAR_SUBPARAMETRO_STARTED =
  'Administracion/data/crearSubparametro/FETCH_CREAR_SUBPARAMETRO_STARTED';
export const FETCH_CREAR_SUBPARAMETRO_FINISHED =
  'Administracion/data/crearSubparametro/FETCH_CREAR_SUBPARAMETRO_FINISHED';
export const FETCH_CREAR_SUBPARAMETRO_RESET = 'Administracion/data/crearSubparametro/FETCH_CREAR_SUBPARAMETRO_RESET';

export function fetchCrearSubparametroStarted() {
  return {
    type: FETCH_CREAR_SUBPARAMETRO_STARTED
  };
}

export function fetchCrearSubparametroFinished(crearSubparametro) {
  return {
    type: FETCH_CREAR_SUBPARAMETRO_FINISHED,
    payload: {
      crearSubparametro
    }
  };
}

export function fetchCrearSubparametroReset() {
  return {
    type: FETCH_CREAR_SUBPARAMETRO_RESET
  };
}

export const fetchCrearSubparametro = values => dispatch =>
  new Promise((resolve, reject) => {
    const { nombreRuta, codigoParametro, descripcion, numeroOrden, descripcionTooltip, codigoTipo } = values;

    const data = {
      idRuta: nombreRuta.length > 0 ? `${nombreRuta}.${codigoParametro}` : nombreRuta,
      codParametro: codigoParametro,
      dscParametro: descripcion,
      numOrden: numeroOrden,
      indActivo: 1,
      dscTooltip: descripcionTooltip,
      codTipo: codigoTipo
    };

    dispatch(fetchCrearSubparametroStarted());
    dispatch(fetch(fetchCreaSubparametro, data))
      .then(resp => {
        if (resp.code === 'CRG-000') {
          dispatch(fetchCrearSubparametroFinished(resp.data));
          resolve(resp);
        } else {
          dispatch(fetchCrearSubparametroFinished([]));
          resolve(resp);
        }
      })
      .catch(error => {
        dispatch(fetchCrearSubparametroFinished([]));
        reject(error);
      });
  });
