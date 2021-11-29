import * as fetchApi from 'services/api';

export function fetchTypeDocument(body) {
  return fetchApi.post('/lsttipodocumentos', body);
}
