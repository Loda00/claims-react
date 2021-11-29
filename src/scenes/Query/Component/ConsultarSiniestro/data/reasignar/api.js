import * as fetchApi from 'services/api';

export function fetchListReasignar(body) {
  return fetchApi.post('/reasignarsiniestro', body);
}
