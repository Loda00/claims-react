import * as fetchApi from 'services/api';

export function fetchTeams(body) {
  return fetchApi.post('/lstequipos', body);
}
