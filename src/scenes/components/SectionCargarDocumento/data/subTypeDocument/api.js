import * as fetchApi from 'services/api';

export function fetchSubTypeDocument(body) {
  return fetchApi.post('/lstsubtipodocumentos', body);
}
