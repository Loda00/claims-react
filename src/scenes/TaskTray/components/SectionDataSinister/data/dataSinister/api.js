import * as fetchApi from 'services/api';

export function fecthDataSinister(body) {
  return fetchApi.post('/obtdetallesiniestro', body);
}
