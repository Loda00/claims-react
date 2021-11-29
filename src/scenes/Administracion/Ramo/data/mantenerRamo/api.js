import * as fetchApi from 'services/api';

export function fetchMantenimientoRamo(body) {
  return fetchApi.post('/mantenerramo', body);
}
