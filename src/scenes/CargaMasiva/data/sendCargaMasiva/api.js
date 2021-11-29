import * as fetchApi from 'services/api';

export function fetchRegistrarCargaMasiva(body) {
  return fetchApi.post('/registrarcargamasiva', body);
}
