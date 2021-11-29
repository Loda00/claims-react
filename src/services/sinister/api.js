import * as fetchApi from 'services/api';

export function fetchSinister(data) {
  return fetchApi.post('/obtsiniestro', data);
}

export function saveSinister(data) {
  return fetchApi.post('/guardarsiniestro', data);
}
