import * as fetchApi from 'services/api';

export function fetchAjustadores(body) {
  return fetchApi.post('/lstajustadores', body);
}
