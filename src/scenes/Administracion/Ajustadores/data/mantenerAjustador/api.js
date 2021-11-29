import * as fetchApi from 'services/api';

export function fetchMantenimientoAjustador(body) {
  return fetchApi.post('/mantenerajustador', body);
}
