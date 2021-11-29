import * as fetchApi from 'services/api';

export function fetchUserClaims(body) {
  return fetchApi.post('/obtusuario', body);
}
