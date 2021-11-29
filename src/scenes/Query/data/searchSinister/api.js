import * as fetchApi from 'services/api';

export function fetchSearchSinister(body) {
  return fetchApi.post('/bscsiniestrosclaims', body);
}
