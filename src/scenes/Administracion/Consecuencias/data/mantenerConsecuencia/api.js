import * as fetchApi from 'services/api';

export function fetchMantenimientoConsecuencia(body) {
  return fetchApi.post('/mantenerconsecuencia', body);
}
