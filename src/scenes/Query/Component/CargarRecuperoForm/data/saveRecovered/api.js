import * as fetchApi from 'services/api';

export function fetchSaveRecovered(body) {
  return fetchApi.post('/guardarrecupero', body);
}
