import * as fetchApi from 'services/api';

export function completeSinister(data) {
  return fetchApi.post('/completarsiniestro', data);
}
