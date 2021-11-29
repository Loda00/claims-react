import * as fetchApi from 'services/api';
import { fetch } from 'services/api/actions';

const fetchValidarCobertura = body => {
  return fetchApi.postRimac('/validarcobertura', body);
};

export const servicioValidaCoberturaRimac = async (dispatch, params) => {
  return dispatch(fetch(fetchValidarCobertura, params));
};

export const validaFechaDeOcurrencia = rangos => {
  let mensajeValidacion;
  if (rangos.length === 0) {
    mensajeValidacion = 'Cobertura no válida para la fecha de ocurrencia seleccionada';
  }

  return mensajeValidacion;
};
