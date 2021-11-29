import * as fetchApi from 'services/api';

export function obtenerReaseguros(body) {
  return fetchApi.post('/obtnuevosreaseguros', body);
}
