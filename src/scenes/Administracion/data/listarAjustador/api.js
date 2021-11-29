import * as fetchApi from 'services/api';

export function fetchListAjustador(body) {
  return fetchApi.post('/buscarajustador', body);
}
