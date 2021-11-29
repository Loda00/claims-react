import * as fetchApi from 'services/api';

export function fetchListConsecuencia(body) {
  return fetchApi.post('/buscarconsecuencia', body);
}
