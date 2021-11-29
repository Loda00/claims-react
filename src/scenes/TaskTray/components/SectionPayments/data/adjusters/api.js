import * as fetchApi from 'services/api';

export function fetchAdjusters(body) {
  return fetchApi.post('/lstajustadores', body);
}
