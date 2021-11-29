import * as fetchApi from 'services/api';

export function fetchMaintenanceConcept(body) {
  return fetchApi.post('/mantenerotrosconceptos', body);
}
