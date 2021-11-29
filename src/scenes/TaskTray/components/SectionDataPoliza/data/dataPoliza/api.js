import * as fetchApi from 'services/api';

export function fecthDataPoliza(body) {
  return fetchApi.post('/obtdetallepolizaclaims', body);
}
