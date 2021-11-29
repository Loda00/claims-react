import * as fetchApi from 'services/api';

export function fetchTaskTable(body) {
  return fetchApi.post('/obtbandeja', body);
}
