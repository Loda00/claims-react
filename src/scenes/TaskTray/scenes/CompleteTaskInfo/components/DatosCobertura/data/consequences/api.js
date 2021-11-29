import * as fetchApi from 'services/api';

export function fetchConsequences(body) {
  return fetchApi.post('/lstconsecuencias', body);
}
