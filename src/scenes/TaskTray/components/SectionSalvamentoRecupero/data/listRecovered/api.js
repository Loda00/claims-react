import * as fetchApi from 'services/api';

export function fetchListRecovered(body) {
  return fetchApi.post('/lstrecupero', body);
}
