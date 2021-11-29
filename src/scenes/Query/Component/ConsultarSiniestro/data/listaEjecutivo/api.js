import * as fetchApi from 'services/api';

export function fetchListEjecutivo(body) {
  return fetchApi.post('/obtusuarioejecutivo', body);
}
