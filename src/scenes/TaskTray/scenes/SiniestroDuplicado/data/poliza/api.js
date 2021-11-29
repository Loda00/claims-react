import * as fetchApi from 'services/api';

export function fetchPolicies(body) {
  return fetchApi.postRimac('/bscpoliza', body);
}
