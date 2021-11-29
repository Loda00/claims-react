import * as fetchApi from 'services/api';

export function fetchListRamos(body) {
  return fetchApi.post('/buscarramo', body);
}
