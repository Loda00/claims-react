import * as fetchApi from 'services/api';

export function fetchPolizaLider(body) {
  return fetchApi.postRimac('/bscpolizacoarec', body);
}
