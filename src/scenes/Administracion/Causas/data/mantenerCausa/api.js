import * as fetchApi from 'services/api';

export function fetchMantenimientoCausa(body) {
  return fetchApi.post('/mantenercausa', body);
}
