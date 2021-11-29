import * as fetchApi from 'services/api';

export function fetchBranches(body) {
  return fetchApi.postRimac('/lstramoscoberturas', body);
}
