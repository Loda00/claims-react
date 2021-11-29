import * as fetchApi from 'services/api';

export function fetchCertificates(body) {
  return fetchApi.postRimac('/bsccertificado', body);
}
