import * as fetchApi from 'services/api';

export function fetchSaveSalvamento(body) {
  return fetchApi.post('/guardarsalvamento', body);
}
