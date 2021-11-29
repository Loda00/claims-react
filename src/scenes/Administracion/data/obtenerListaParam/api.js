import * as fetchApi from 'services/api';

export function fetchListParametros(body) {
  return fetchApi.post('/obtenerlista', body);
}

export default fetchListParametros;
