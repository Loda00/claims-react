import * as fetchApi from 'services/api';

export function fetchPolicies(body) {
  return fetchApi.postRimac('/bscpoliza', body);
}

export function fetchDetallePoliza(body) {
  return fetchApi.postRimac('/bscpolizadetalle', body);
}
