import * as fetchApi from 'services/api';

export function editarCobertura(body) {
  return fetchApi.post('/actualizarreservacobertura', body);
}
