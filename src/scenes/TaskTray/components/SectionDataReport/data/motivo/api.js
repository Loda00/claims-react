import * as fetchApi from 'services/api';

export function obtenerMotivo(body) {
  return fetchApi.postRimac('/obtenerlista', body);
}
