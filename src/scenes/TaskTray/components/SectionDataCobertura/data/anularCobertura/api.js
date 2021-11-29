import * as fetchApi from 'services/api';

export function anularCobertura(body) {
  return fetchApi.post('/actualizarreservacobertura', body);
}
