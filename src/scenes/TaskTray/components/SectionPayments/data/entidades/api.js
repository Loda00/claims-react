import * as fetchApi from 'services/api';

export function fetchEntidades(body) {
  return fetchApi.postRimac('/lstentidadfinanciera', body);
}
