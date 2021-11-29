import * as fetchApi from 'services/api';

export function fetchListCausa(body) {
  return fetchApi.post('/buscarcausa', body);
}
