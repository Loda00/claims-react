import * as fetchApi from 'services/api';

export function fetchThirdParty(body) {
  return fetchApi.postRimac('/buscartercero', body);
}
