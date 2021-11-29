import * as fetchApi from 'services/api';

export function fetchCauses(body) {
  return fetchApi.post('/lstcausas', body);
}
