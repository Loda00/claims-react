import * as fetchApi from 'services/api';

export function fetchListRamo(body) {
  return fetchApi.post('/lstramos', body);
}
