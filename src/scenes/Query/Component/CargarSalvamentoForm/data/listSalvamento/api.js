import * as fetchApi from 'services/api';

export function fetchListSalvamento(body) {
  return fetchApi.post('/lstsalvamento', body);
}
