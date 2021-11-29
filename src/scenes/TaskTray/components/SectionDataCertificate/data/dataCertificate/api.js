import * as fetchApi from 'services/api';

export function fecthDataCertificate(body) {
  return fetchApi.post('/obtdetallecertificado', body);
}
