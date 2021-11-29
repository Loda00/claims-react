import * as fetchApi from 'services/api';

export function obtenerDatosInforme(body) {
  return fetchApi.post('/obtdatosinforme', body);
}
