import * as fetchApi from 'services/api';

export function fetchStateSinister(body) {
  return fetchApi.post('/lstestadossiniestro', body);
}
