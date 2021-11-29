import * as fetchApi from 'services/api';

export function fetchTaskTypes(data) {
  return fetchApi.post('/bsctareas', data);
}
