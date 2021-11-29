import * as fetchApi from 'services/api';

export function fetchAddresses(body) {
  return fetchApi.postRimac('/buscarubicacion', body);
}
